import { DialogTitle } from "@radix-ui/react-dialog";
import { Form, useNavigation } from "@remix-run/react";
import { AlertCircle } from "lucide-react";
import { CgSpinnerTwo } from "react-icons/cg";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "~/components/ui/dialog";

export default function AccountDeleteDialog({ user }: any) {
  const navigation = useNavigation();
  const isLoading = navigation.formData?.get("intent") === "delete-account";
  return (
    <DialogContent className="bg-red-100">
      <DialogHeader>
        <DialogTitle className="text-xl">
          Are you sure you want to delete your account?
        </DialogTitle>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            This action is irreversible. All your data will be lost.
          </AlertDescription>
        </Alert>
        <ul className="list-inside list-disc mt-6">
          <li>Your account will be deleted</li>
          <li>Your data will be lost</li>
          <li>Your subscription will be cancelled</li>
        </ul>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Form method="post">
            <input
              type="hidden"
              name="intent"
              value="delete-account"
              required
            />
            <input type="hidden" name="userId" value={user.userId} required />
            <Button type="submit" variant="destructive">
              {isLoading ? (
                <CgSpinnerTwo className="mr-4  animate-spin" />
              ) : null}
              Confirm
            </Button>
          </Form>
        </DialogFooter>
      </DialogHeader>
    </DialogContent>
  );
}
