import { Link } from "@remix-run/react";
import { BiReset } from "react-icons/bi";
import { FiCheckCircle } from "react-icons/fi";
import { LuCircleDotDashed } from "react-icons/lu";
import { ICourseProgress, Status } from "~/constants/types";
import { Table, TableBody, TableCell, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { capitalizeFirstLetter } from "~/utils/cs";

type CCCProps = {
  userCourses: ICourseProgress[];
};

export function CourseCatalogCard({ userCourses }: CCCProps) {
  return (
    <div className="rounded-md bg-teal-300/30 p-6 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4 text-teal-600">Course catalog</h2>
      <Table>
        <TableBody className="text-slate-600 text-lg">
          {userCourses && userCourses?.length ? (
            userCourses.map((course, index) => (
              <TableRow key={`${course.title}-${index}`}>
                <TableCell className="text-blue-700">
                  <Link prefetch="intent" to={`/courses/${course.id}`}>
                    {capitalizeFirstLetter(course.title)}
                  </Link>
                </TableCell>

                <TableCell className="flex gap-4 items-center justify-end">
                  <span className="text-sm"> {course.score}%</span>{" "}
                  <Link prefetch="intent" to={`/courses/${course.id}`}>
                    <Button
                      className="bg-teal-500 hover:bg-teal-400 py-1 font-black"
                      size="icon"
                    >
                      {course.status === Status.IN_PROGRESS ? (
                        <LuCircleDotDashed size={20} />
                      ) : (
                        <FiCheckCircle size={20} />
                      )}
                    </Button>
                  </Link>
                  <Button
                    className="bg-red-400 hover:bg-red-300 py-1 font-black"
                    size="icon"
                  >
                    <BiReset size={20} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2}>
                No courses in your catalog.
                <br />
                <span className="text-sm">
                  Add a course to your catalog to begin your journey.
                </span>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
