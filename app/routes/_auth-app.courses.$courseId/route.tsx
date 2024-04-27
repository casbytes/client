import React from "react";
import { Await, useLoaderData, useRouteError } from "@remix-run/react";
import { LoaderFunctionArgs, defer } from "@remix-run/node";
import { cacheOptions } from "~/utils/session.server";
import { getModules, getSubModules } from "./utils";
import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { SheetContent } from "~/components/ui/sheet";
import { ErrorUI } from "~/components/error-ui";
import { Separator } from "~/components/ui/separator";
import { SubModules } from "./components/sub-modules";
import { Title } from "./components/title";
import { Assessment } from "./components/assessment";
import { CourseSideContent } from "./components/course-side-content";

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const modules = getModules(request, params);
    const subModules = getSubModules(request, params);

    return defer({ modules, subModules }, cacheOptions);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to load course data, please try again.");
  }
}

export default function CoursesRoute() {
  const { modules, subModules } = useLoaderData<typeof loader>();
  return (
    <Container className="max-w-3xl lg:max-w-6xl mt-6">
      <BackButton to="/dashboard" buttonText="dashboard" />
      <Title subModules={subModules} />
      <div className="lg:grid lg:grid-cols lg:grid-cols-5 gap-6">
        <ul className="col-span-3 flex flex-col gap-6 overflow-y-auto h-auto max-h-screen">
          <div className="bg-[url('https://cdn.casbytes.com/assets/elearning2.png')] bg-no-repeat bg-contain">
            <div className="flex flex-col gap-6 bg-slate-100/90">
              <React.Suspense
                fallback={
                  <div className="h-8 bg-slate-400 rounded-md w-full animate-pulse" />
                }
              >
                <Await resolve={subModules}>
                  {(subModules) => <Assessment subModules={subModules} />}
                </Await>
              </React.Suspense>
              <Separator className="bg-sky-700 h-2 rounded-tl-md rounded-br-md" />
              <SubModules subModules={subModules} />
            </div>
          </div>
        </ul>

        {/* mobile screens */}
        <SheetContent className="lg:hidden overflow-y-auto w-full sm:w-auto">
          <CourseSideContent modules={modules} />
        </SheetContent>

        {/* large screens */}
        <aside className="hidden lg:block col-span-2 border bg-zinc-100 overflow-y-auto max-h-screen">
          <CourseSideContent modules={modules} />
        </aside>
      </div>
    </Container>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <ErrorUI error={error} />;
}
