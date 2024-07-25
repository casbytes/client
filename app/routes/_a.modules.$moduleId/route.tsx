import React from "react";
import { Await, useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs, defer } from "@remix-run/node";
import {
  getModuleBadges,
  getSubModules,
  getModule,
  getTest,
  getCheckpoint,
} from "./utils.server";
import { getUser } from "~/utils/session.server";
import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { SheetContent } from "~/components/ui/sheet";
import { Separator } from "~/components/ui/separator";
import { Assessment } from "~/components/assessment";
import { PageTitle } from "~/components/page-title";
import { SubModules } from "~/components/modules";
import { SideContent } from "./components/side-content";
import { metaFn } from "~/utils/meta";

export const meta = metaFn;

export async function loader({ request, params }: LoaderFunctionArgs) {
  const module = getModule(request, params);
  const moduleBadges = getModuleBadges(request, params);
  const subModules = getSubModules(request, params);
  const [test, checkpoint] = await Promise.all([
    getTest(request, params),
    getCheckpoint(request, params),
  ]);
  const user = await getUser(request);
  return defer({ moduleBadges, subModules, module, test, checkpoint, user });
}

export default function ModuleRoute() {
  const { moduleBadges, subModules, module, test, checkpoint, user } =
    useLoaderData<typeof loader>();
  const item = { test, checkpoint };
  return (
    <Container className="max-w-3xl lg:max-w-7xl">
      <BackButton to="/dashboard" buttonText="dashboard" />
      <React.Suspense
        fallback={<PageTitle title="Loading..." className="mb-8" />}
      >
        <Await resolve={module}>
          {(module) => <PageTitle title={module.title} className="mb-8" />}
        </Await>
      </React.Suspense>

      <div className="lg:grid lg:grid-cols lg:grid-cols-5 gap-6">
        <ul className="col-span-3 flex flex-col gap-6 overflow-y-auto h-auto max-h-screen">
          <div className="bg-[url('https://cdn.casbytes.com/assets/elearning2.png')] bg-no-repeat bg-contain">
            <div className="flex flex-col gap-6 bg-slate-100/90">
              <Assessment item={item} />
              <Separator className="bg-sky-700 h-2 rounded-tl-md rounded-br-md" />
              <SubModules subModules={subModules} user={user} />
            </div>
          </div>
        </ul>

        {/* mobile screens */}
        <SheetContent className="lg:hidden overflow-y-auto w-full sm:w-auto">
          <SideContent
            user={user}
            module={module}
            moduleBadges={moduleBadges}
          />
        </SheetContent>

        {/* large screens */}
        <aside className="hidden lg:block col-span-2 border bg-zinc-100 overflow-y-auto max-h-screen">
          <SideContent
            user={user}
            module={module}
            moduleBadges={moduleBadges}
          />
        </aside>
      </div>
    </Container>
  );
}

// function PendingAssessment() {
//   return (
//     <ul className="space-y-3">
//       {Array.from({ length: 2 }).map((_, i) => (
//         <li key={i} className="bg-gray-300 h-8 rounded-md animate-pulse"></li>
//       ))}
//     </ul>
//   );
// }