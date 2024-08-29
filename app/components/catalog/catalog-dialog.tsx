import React from "react";
import { useMatches } from "@remix-run/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { MetaCourse, MetaModule } from "~/services/sanity/types";
import { Badge } from "../ui/badge";
import { FaStar } from "react-icons/fa6";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Image } from "../image";
import { CourseCard } from "./course-card";
import { ModuleCard } from "./module-card";

export function CatalogDialog({
  module,
  course,
  dialogActionButton,
  cardActionButton,
}: {
  module?: MetaModule;
  course?: MetaCourse;
  dialogActionButton?: React.ReactNode;
  cardActionButton?: React.ReactNode;
}) {
  const item = module ?? (course as MetaCourse);
  const matches = useMatches();
  const isAuth = matches.some((match) => match.id.includes("_a"));
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{capitalizeFirstLetter(item.title!)}</DialogTitle>
          <DialogDescription>
            {course ? (
              <Image
                src={`meta/${course.image}`}
                alt={course.title}
                className="rounded-md mx-auto w-full h-[14rem] object-cover my-4"
              />
            ) : null}
            {item?.description}
            <p className="mt-4 font-mono text-xs max-w-xs text-center mx-auto font-black">
              Sign in to complete your onboarding and start your learning
              journey.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between w-full">
              <Badge>{item?.premium ? "Premium" : "free"}</Badge>{" "}
              <Badge>
                <FaStar /> <Separator orientation="vertical" className="mx-2" />{" "}
                4.5
              </Badge>
            </div>
            <Button variant={"outline"} asChild className="self-end">
              <DialogClose>Close</DialogClose>
            </Button>
            {isAuth ? dialogActionButton : null}
          </div>
        </DialogFooter>
      </DialogContent>
      {course ? (
        <CourseCard course={course} cardActionButton={cardActionButton} />
      ) : (
        <ModuleCard module={module} cardActionButton={cardActionButton} />
      )}
    </Dialog>
  );
}