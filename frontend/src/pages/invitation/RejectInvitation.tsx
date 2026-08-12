import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, X } from "lucide-react";

import { useRejectInvitation } from "@/hooks/useInvitations";
import { parseApiError } from "@/lib/errors";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Matches the link format the backend's invitation email template intends
 * to use: `${CLIENT_URL}/reject-invitation/:token`. Rejecting is
 * destructive, so we confirm before calling the API rather than firing
 * automatically on load.
 */
export default function RejectInvitation() {
  const { token } = useParams<{ token: string }>();
  const rejectInvitation = useRejectInvitation();
  const [error, setError] = useState<string | null>(null);

  const handleReject = () => {
    if (!token) return;
    setError(null);
    rejectInvitation.mutate(token, {
      onError: (err) => setError(parseApiError(err).message),
    });
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {rejectInvitation.isSuccess ? (
              <Check className="size-4 text-success" />
            ) : error ? (
              <X className="size-4 text-destructive" />
            ) : null}
            <CardTitle>Reject invitation</CardTitle>
          </div>
          <CardDescription>
            You won't be able to join using this invitation after rejecting it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {rejectInvitation.isSuccess ? (
            <>
              <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                Invitation rejected.
              </p>
              <Link to="/dashboard" className={cn(buttonVariants(), "w-full")}>
                Go to dashboard
              </Link>
            </>
          ) : (
            <>
              {error && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  loading={rejectInvitation.isPending}
                  onClick={handleReject}
                >
                  Reject invitation
                </Button>
                <Link
                  to="/dashboard"
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  Cancel
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
