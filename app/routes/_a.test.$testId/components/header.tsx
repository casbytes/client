import React from "react";
import { useNavigate } from "@remix-run/react";
import { format, addSeconds } from "date-fns";
import { TestAlert } from "./test-alert";
import { Progress } from "~/components/ui/progress";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/libs/shadcn";
import { Separator } from "~/components/ui/separator";

type TestHeaderProps = {
  progress: number;
  questionsLength: number;
  submitForm: () => Promise<void>;
  redirectUrl: string;
  currentQuestionIndex: number;
};

export function TestHeader({
  progress,
  submitForm,
  redirectUrl,
  questionsLength,
  currentQuestionIndex,
}: TestHeaderProps) {
  const [alert, setAlert] = React.useState(true);

  // const timePerQuestion = 1.5 * 60;
  // const totalTime = timePerQuestion * questionsLength;
  const [timeLeft, setTimeLeft] = React.useState(20);

  const navigate = useNavigate();

  const ALERT_INTERVAL = 30000;
  const INTERVAL = 1000;
  const LEAST_TIME = 0;
  const WARNING_TIME = 300; // 5 minutes (5 * 60 = 300 seconds)
  const ONE_MINUTE = 60;

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setAlert(false);
    }, ALERT_INTERVAL);
    return () => window.clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (timeLeft > LEAST_TIME) {
      const timer = window.setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, INTERVAL);
      return () => window.clearInterval(timer);
    } else {
      async function sAN() {
        await submitForm();
        navigate(-2);
      }
      sAN();
    }
  }, [timeLeft, navigate]);

  function formatTime(seconds: number) {
    const time = addSeconds(new Date(LEAST_TIME), seconds);
    return format(time, "mm:ss");
  }

  return (
    <>
      {alert ? <TestAlert /> : null}
      <div className="flex gap-6 items-center mb-2 mt-6 bg-stone-200 rounded-md p-2">
        <div>
          Time left:{" "}
          <Badge
            className={cn("text-lg", {
              "bg-red-500 hover:bg-red-400": timeLeft <= WARNING_TIME,
            })}
          >
            <span
              className={cn({
                "animate-bounce": timeLeft <= ONE_MINUTE,
              })}
            >
              {formatTime(timeLeft)}
            </span>
          </Badge>
        </div>
        <Separator orientation="vertical" className="h-10 bg-sky-700" />
        <div className="flex flex-1 items-center gap-4">
          <Progress value={progress} className="h-2" />
          <Badge className="text-lg">
            {currentQuestionIndex + 1}/{questionsLength}
          </Badge>
        </div>
      </div>
    </>
  );
}
