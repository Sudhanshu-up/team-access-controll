import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, X } from "lucide-react";

import { useAcceptInvitation } from "@/hooks/useInvitations";
import { parseApiError } from "@/lib/errors";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingState } from "@/components/common/QueryState";
import { cn } from "@/lib/utils";

/**
 * Matches the link format used by the backend's invitation email template:
 * `${CLIENT_URL}/accept-invitation/:token`.
 */
export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const acceptInvitation = useAcceptInvitation();
  const [error, setError] = useState<string | null>(null);
  

  const handleAccept = () => {
  if (!token) {
    setError("Invalid invitation token.");
    return;
  }

  acceptInvitation.mutate(token, {
    onError: (err) => {
      setError(parseApiError(err).message);
    },
  });
};
  return (
    
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {acceptInvitation.isSuccess ? (
              <Check className="size-4 text-success" />
            ) : error ? (
              <X className="size-4 text-destructive" />
            ) : null}
            <CardTitle>Invitation</CardTitle>
          </div>
          <CardDescription>Accepting your invitation...</CardDescription>
        </CardHeader>
       <CardContent>
  {!acceptInvitation.isSuccess && !error && (
    <button
      onClick={handleAccept}
      disabled={acceptInvitation.isPending}
      className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
    >
      {acceptInvitation.isPending
        ? "Accepting..."
        : "Accept Invitation"}
    </button>
  )}

  {acceptInvitation.isPending && (
    <LoadingState label="Accepting invitation..." />
  )}

  {acceptInvitation.isSuccess && (
    <div className="flex flex-col gap-3">
      <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
        You've joined the organization.
      </p>

      <Link
        to="/dashboard"
        className={cn(buttonVariants(), "w-full")}
      >
        Go to dashboard
      </Link>
    </div>
  )}

  {error && (
    <div className="flex flex-col gap-3">
      <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {error}
      </p>

      <Link
        to="/invitations"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full"
        )}
      >
        Try a different token
      </Link>
    </div>
  )}
       </CardContent>
      </Card>
    </div>
  );
}
