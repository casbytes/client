import type { User } from "~/utils/db.server";
import { FaLock, FaLockOpen } from "react-icons/fa6";
import { Button } from "./ui/button";
import { Link } from "@remix-run/react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function DiscordCard({ user }: { user: User }) {
  const isSubscribed = user.subscribed;
  return (
    <Card className="rounded-md bg-blue-400/35 p-4 flex flex-col items-center h-full border border-blue-500 shadow-lg">
      <CardHeader>
        <CardTitle className="font-mono">Discord community</CardTitle>
      </CardHeader>

      <CardContent>
        <p className=" text-slate-600 text-center max-w-xs mt-4">
          {isSubscribed
            ? "You now have access to our Discord community. Enjoy your learning experience!"
            : "Upgrade to CASBytes Premium to gain access to our community Discord server."}
        </p>
        <Button
          disabled={!isSubscribed}
          size="lg"
          className="mt-4 bg-blue-400/50 hover:bg-blue-400 text-blue-700 mx-auto block"
        >
          <Link to="/subscription" className="flex gap-2 items-center">
            {isSubscribed ? (
              <FaLockOpen className="h-6 w-6 text-blue-400" />
            ) : (
              <FaLock className="font-bold h-6 w-6 text-blue-500" />
            )}
            Join discord
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
