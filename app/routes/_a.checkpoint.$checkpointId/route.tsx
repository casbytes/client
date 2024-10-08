import React from "react";
import { Container } from "~/components/container";
import { Markdown } from "~/components/markdown";
import { PageTitle } from "~/components/page-title";
import { BackButton } from "~/components/back-button";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { getCheckpoint, gradeCheckpoint } from "./utils.server";
import { useActionData, useLoaderData } from "@remix-run/react";
import { IFrame } from "~/components/iframe";
import { getUser } from "~/utils/session.server";
import { CheckpointResponse } from "~/components/checkpoint-response";
import { metaFn } from "~/utils/meta";

export const meta = metaFn;

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const user = await getUser(request);
    const { checkpoint, checkpointContent } = await getCheckpoint(
      request,
      params
    );
    return json({ user, checkpoint, checkpointContent });
  } catch (error) {
    throw error;
  }
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    return await gradeCheckpoint(request);
  } catch (error) {
    throw error;
  }
}

export default function CheckPointRoute() {
  const { checkpoint, checkpointContent } = useLoaderData<typeof loader>();
  const checkpointResponse = useActionData<typeof action>();

  const moduleWithCourseId = checkpoint?.module?.courseId;
  const moduleId = checkpoint?.moduleId ?? null;
  // const subModuleId = checkpoint?.subModuleId ?? null;
  const moduleWithCourseCheckpoint = !!moduleWithCourseId;
  const moduleCheckpoint = !!moduleId;

  const checkpointTitle = checkpoint.title;
  const moduleOrSubModuleTitle =
    checkpoint?.module?.title ?? checkpoint?.subModule?.title;

  const moduleOrSubModuleUrl = moduleWithCourseCheckpoint
    ? `/courses/${checkpoint?.module?.courseId}?moduleId=${checkpoint?.moduleId}`
    : moduleCheckpoint
    ? `/modules/${checkpoint?.moduleId}`
    : `/sub-modules/${checkpoint?.subModuleId}`;

  React.useEffect(() => {}, [checkpointResponse]);

  return (
    <Container className="max-w-4xl">
      <PageTitle title={checkpointTitle} />
      <BackButton
        to={moduleOrSubModuleUrl}
        buttonText={moduleOrSubModuleTitle}
        className="mt-4"
      />
      <>
        {checkpointContent?.data?.videoId ? (
          <IFrame videoId={checkpointContent.data.videoId} />
        ) : null}
        <Markdown source={checkpointContent.content} />
      </>
      <CheckpointResponse
        item={checkpoint}
        response={checkpointResponse ?? null}
      />
    </Container>
  );
}
