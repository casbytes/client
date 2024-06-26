import invariant from "tiny-invariant";
import matter from "gray-matter";
import { Params } from "@remix-run/react";
import { InternalServerError, NotFoundError } from "~/errors";
import { getContentFromGithub } from "~/utils/octokit.server";
import { getUser } from "../../utils/sessions.server";
import { prisma } from "~/libs/prisma.server";
import {
  ILessonProgress,
  ISubModuleProgress,
  Status,
  TestStatus,
} from "~/constants/types";

/**
 * Get sub module by given ID
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<ISubModuleProgress>}
 */
export async function getSubModule(
  request: Request,
  params: Params<string>
): Promise<ISubModuleProgress> {
  try {
    invariant(params.subModuleId, "Submodule ID is required.");
    const subModuleId = params.subModuleId;
    const user = await getUser(request);
    const subModule = await prisma.subModuleProgress.findFirst({
      where: {
        id: subModuleId,
        users: { some: { id: user.id } },
      },
      include: {
        test: true,
        checkpoint: true,
        moduleProgress: true,
      },
    });
    if (!subModule) {
      throw new NotFoundError("Sub module not found.");
    }
    return subModule;
  } catch (error) {
    throw new InternalServerError(
      "An error occured why fetching sub modules, please try again."
    );
  }
}

/**
 * Get subModule lessons
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<ILessonProgress[]>}
 */
export async function getLessons(
  request: Request,
  params: Params<string>
): Promise<ILessonProgress[]> {
  invariant(params.subModuleId, "Submodule ID is required to fetch lessons.");
  const subModuleId = params.subModuleId;

  try {
    const user = await getUser(request);

    /**
     * Fetch the first lesson of the sub module
     * to update its status to in progress if it is locked
     */
    const firstLesson = await prisma.lessonProgress.findFirst({
      where: {
        subModuleProgressId: subModuleId,
        users: { some: { id: user.id } },
      },
      orderBy: {
        order: "asc",
      },
    });

    if (!firstLesson) {
      throw new NotFoundError("First lesson not found.");
    }

    const [lessons] = await Promise.all([
      prisma.lessonProgress.findMany({
        where: {
          subModuleProgressId: subModuleId,
          users: { some: { id: user.id } },
        },
        orderBy: {
          order: "asc",
        },
      }),
      /**
       * Update the status of the first lesson to in progress if it is locked
       */
      updateFirstLessonStatus(user.id, firstLesson),
    ]);
    return lessons;
  } catch (error) {
    throw new InternalServerError(
      "An error occured while fetching lessons, please try again."
    );
  }
}

/**
 * Update the status of the first lesson to in progress if it is locked
 * @param {String} userId - User ID
 * @param {ILessonProgress} lessonProgress - Lesson Progress
 * @returns {Promise<ILessonProgress>} - Promise
 */
async function updateFirstLessonStatus(
  userId: string,
  lessonProgress: ILessonProgress
): Promise<ILessonProgress | void> {
  if (lessonProgress.status !== Status.LOCKED) {
    return;
  }
  return prisma.lessonProgress.update({
    where: {
      id: lessonProgress.id,
      users: { some: { id: userId } },
    },
    data: {
      status: Status.IN_PROGRESS,
    },
  });
}

/**
 * Get lessons content from Github by given submodule ID and lesson slug
 * @param {Request} request
 * @param {Params<string>} params
 * @returns {Promise<string>}
 */
export async function getLessonContent(
  request: Request,
  params: Params<string>
): Promise<any> {
  try {
    invariant(params.subModuleId, "Submodule ID is required to fetch lessons.");
    const subModuleId = params.subModuleId;
    const lessonSlug = getLessonSlug(request);
    const user = await getUser(request);

    const currentLesson = await prisma.lessonProgress.findFirst({
      where: {
        subModuleProgressId: subModuleId,
        users: { some: { id: user.id } },
        ...(lessonSlug && { slug: lessonSlug }),
      },
      orderBy: {
        order: "asc",
      },
      include: {
        subModuleProgress: {
          include: {
            moduleProgress: true,
          },
        },
      },
    });

    if (!currentLesson) {
      throw new NotFoundError("Lesson not found.");
    }

    // await prisma.lessonProgress.update({
    //   where: {
    //     id: currentLesson.id,
    //     users: { some: { id: user.id } },
    //   },
    //   data: {
    //     status: Status.IN_PROGRESS,
    //   },
    // });

    const [previousLesson, nextLesson] = await getPreviousAndNextLessons(
      user.id,
      subModuleId,
      currentLesson
    );

    /**
     * Update the status of the current lesson and the next lesson
     */
    await updateLessonStatuses(currentLesson, nextLesson, user.id, subModuleId);
    /**
     * Fetch lesson content from Github
     * The repo name is the slug of the associated module progress
     * Path: subModuleSlug/lessons/lessonSlug.mdx
     */
    const repo = `${currentLesson!.subModuleProgress.moduleProgress.slug}`;
    const path = `${currentLesson!.subModuleProgress.slug}/lessons/${
      currentLesson!.slug
    }.mdx`;

    const { content: mdxContent } = await getContentFromGithub({
      repo,
      path,
    });

    if (!mdxContent) {
      throw new NotFoundError("Empty lesson content.");
    }

    const { data, content } = matter(mdxContent);
    return {
      mdx: { data, content },
      previousLesson,
      currentLesson,
      nextLesson,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError(
      "An error occured while fetching lesson content from CMS, please try again."
    );
  }
}

async function updateLessonStatuses(
  currentLesson: ILessonProgress,
  nextLesson: ILessonProgress | null,
  userId: string,
  subModuleId: string
) {
  try {
    await prisma.$transaction(async (txn) => {
      /**
       * If the user is viewing the lesson, mark it as completed
       * and update the next lesson to IN_PROGRESS
       */
      if (currentLesson.status === Status.IN_PROGRESS) {
        await txn.lessonProgress.update({
          where: {
            id: currentLesson.id,
            users: { some: { id: userId } },
          },
          data: {
            status: Status.COMPLETED,
          },
        });

        /**
         * Update the status of the next lesson to in progress if it is locked
         */
        if (nextLesson) {
          if (nextLesson.status === Status.LOCKED) {
            await txn.lessonProgress.update({
              where: {
                id: nextLesson.id,
                users: { some: { id: userId } },
              },
              data: {
                status: Status.IN_PROGRESS,
              },
            });
          }
        } else {
          /**
           * If there is no next lesson, update
           * the status of the sub module test to available
           */
          const subModuleTest = await txn.test.findFirst({
            where: {
              subModuleProgressId: subModuleId,
              users: { some: { id: userId } },
            },
          });

          if (
            subModuleTest &&
            subModuleTest.status === TestStatus.LOCKED &&
            !subModuleTest.attempted
          ) {
            await txn.test.update({
              where: {
                id: subModuleTest.id,
              },
              data: {
                status: TestStatus.AVAILABLE,
              },
            });
          }
        }
      }
    });
  } catch (error) {
    throw new InternalServerError(
      "An error occured while updating lesson statuses, please try again."
    );
  }
}

/**
 * Get previous and next lessons of a current lesson
 * @param {String} subModuleId
 * @param {ILessonProgress} currentLesson
 * @param {Request} request
 * @returns {Promise<Array<ILessonProgress|null>>}
 */
async function getPreviousAndNextLessons(
  userId: string,
  subModuleId: string,
  currentLesson: ILessonProgress
): Promise<Array<ILessonProgress | null>> {
  try {
    return Promise.all([
      prisma.lessonProgress.findFirst({
        where: {
          subModuleProgressId: subModuleId,
          users: { some: { id: userId } },
          order: { lt: currentLesson.order },
        },
        // orderBy: {
        //   order: "asc",
        // },
      }),
      prisma.lessonProgress.findFirst({
        where: {
          subModuleProgressId: subModuleId,
          users: { some: { id: userId } },
          order: { gt: currentLesson.order },
        },
        // orderBy: {
        //   order: "asc",
        // },
      }),
    ]);
  } catch (error) {
    throw new InternalServerError(
      "An error occured while fetching previous and next lessons, please try again."
    );
  }
}

/**
 * Get lesson slug
 * @param {Request} request
 * @returns {String | undefined}
 */
function getLessonSlug(request: Request): string | undefined {
  return getSearchParam(request, "lessonSlug");
}

/**
 * Get search param from request
 * @param {Request} request
 * @param {String} key
 * @returns {String | undefined}
 */
function getSearchParam(request: Request, key: string): string | undefined {
  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);
  return search.get(key) ?? undefined;
}
