import { deleteStripeCustomer } from "~/services/stripe.server";
import { prisma } from "~/utils/db.server";
import { getUserId, signOut } from "~/utils/session.server";

export async function handleActions(request: Request) {
  const formData = await request.formData();
  const userId = await getUserId(request);
  const intent = formData.get("intent") as "deleteAccount" | "updateProfile";
  switch (intent) {
    case "deleteAccount":
      return deleteUser(formData, userId, request);
    case "updateProfile":
      return updateUser(formData, userId);
    default:
      throw new Error("Invalid intent.");
  }
}

export async function deleteUser(
  formData: FormData,
  userId: string,
  request: Request
) {
  const intent = formData.get("intent") as "deleteAccount";

  try {
    if (intent !== "deleteAccount") {
      throw new Error("Invalid form data.");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    await prisma.$transaction(async (txn) => {
      await deleteStripeCustomer({
        stripeCustomerId: user.stripeCustomerId!,
      }),
        await txn.course.deleteMany({
          where: { users: { some: { id: userId } } },
        }),
        /**
         * Delete individual user modules progress if any
         */
        await txn.module.deleteMany({
          where: { users: { some: { id: userId } } },
        }),
        await txn.test.deleteMany({
          where: { id: user.id },
        }),
        await txn.project.deleteMany({
          where: { id: user.id },
        }),
        await txn.checkpoint.deleteMany({
          where: { id: user.id },
        }),
        await txn.user.delete({
          where: { id: user.id },
        });
    });

    /**
     * !Send googbye email
     */
    return signOut(request);
  } catch (error) {
    throw error;
  }
}

export async function updateUser(formData: FormData, userId: string) {
  const intent = formData.get("intent") as "updateProfile";
  const name = formData.get("name") as string;
  const githubUsername = formData.get("githubUsername") as string | null;

  try {
    if (intent !== "updateProfile") {
      throw new Error("Invalid form data.");
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, githubUsername },
    });
    if (!user) {
      throw new Error("user not found");
    }
    return { success: true };
  } catch (error) {
    throw error;
  }
}
