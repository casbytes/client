import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useRouteError,
  useNavigation,
} from "@remix-run/react";
import { FiCheckCircle } from "react-icons/fi";
import { CgSpinnerTwo } from "react-icons/cg";
import { FaArrowRightLong } from "react-icons/fa6";
import { prisma } from "~/libs/prisma.server";
import { readContent } from "~/utils/read-mdx-content.server";
import { getUser } from "../utils/sessions.server";
import { Container } from "~/components/container";
import { ErrorUI } from "~/components/error-ui";
import { Markdown } from "~/components/markdown";
import { PageTitle } from "~/components/page-title";
import { Button } from "~/components/ui/button";
import { BadRequestError, InternalServerError } from "~/errors";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const [user, content] = await Promise.all([
      getUser(request),
      readContent("onboarding.mdx"),
    ]);
    if (!user) throw new BadRequestError("User not found.");
    return json({ content, user });
  } catch (error) {
    throw new InternalServerError();
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const userId = String(formData.get("userId"));

  if (intent !== "markAsCompleted" || !userId) {
    throw new BadRequestError("Invalid form data.");
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { completedOnboarding: true },
    });
    return redirect("/dashboard");
  } catch (error) {
    throw new InternalServerError();
  }
}

export default function Onboarding() {
  const { user, content } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isLoading = navigation.formData?.get("intent") === "markAsCompleted";

  return (
    <Container>
      <div className="mx-auto max-w-4xl">
        <PageTitle title="Onboarding" className="text-lg mb-6" />
        <Markdown source={content} />
        {user.completedOnboarding ? (
          <Button asChild className="flex items-center mt-8 text-lg">
            <Link to="/dashboard">
              Dashboard <FaArrowRightLong className="ml-4" />
            </Link>
          </Button>
        ) : (
          <Form method="post" className="block">
            <input type="hidden" name="userId" value={user.id} required />
            <Button
              type="submit"
              name="intent"
              value="markAsCompleted"
              className="flex w-full items-center mt-8 text-lg"
            >
              {isLoading ? (
                <CgSpinnerTwo className="mr-4 animate-spin" />
              ) : (
                <FiCheckCircle className="mr-4" />
              )}
              mark as completed
            </Button>
          </Form>
        )}
      </div>
    </Container>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <ErrorUI error={error} />;
}
