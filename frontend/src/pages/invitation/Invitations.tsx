import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Mail, X } from "lucide-react";
import toast from "react-hot-toast";

import { useAcceptInvitation, useRejectInvitation } from "@/hooks/useInvitations";
import { parseApiError } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

const schema = z.object({
  token: z.string().trim().min(1, "Invitation token is required"),
});

type FormValues = z.infer<typeof schema>;

export default function Invitations() {
  const acceptInvitation = useAcceptInvitation();
  const rejectInvitation = useRejectInvitation();
  const [pendingReject, setPendingReject] = useState<string | null>(null);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onAccept = async (values: FormValues) => {
    setResult(null);
    try {
      await acceptInvitation.mutateAsync(values.token);
      setResult({ type: "success", message: "Invitation accepted. You're now a member." });
      toast.success("Invitation accepted");
    } catch (error) {
      const message = parseApiError(error).message;
      setResult({ type: "error", message });
    }
  };

  const onRejectClick = async () => {
    const valid = await trigger("token");
    if (!valid) return;
    setPendingReject(getValues("token"));
  };

  const confirmReject = async () => {
    if (!pendingReject) return;
    setResult(null);
    try {
      await rejectInvitation.mutateAsync(pendingReject);
      setResult({ type: "success", message: "Invitation rejected." });
      toast.success("Invitation rejected");
      setPendingReject(null);
    } catch (error) {
      const message = parseApiError(error).message;
      setResult({ type: "error", message });
      setPendingReject(null);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="size-4" />
            <CardTitle>Invitations</CardTitle>
          </div>
          <CardDescription>
            Paste the invitation token from your email to accept or reject
            an invitation. (The API doesn't currently expose a way to list
            pending invitations, so this works from the token directly.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="token">Invitation token</Label>
              <Input
                id="token"
                placeholder="Paste your invitation token"
                invalid={!!errors.token}
                {...register("token")}
              />
              {errors.token && (
                <p className="text-xs text-destructive">
                  {errors.token.message}
                </p>
              )}
            </div>

            {result && (
              <p
                className={
                  result.type === "success"
                    ? "rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
                    : "rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                }
              >
                {result.message}
              </p>
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={handleSubmit(onAccept)}
                loading={acceptInvitation.isPending}
              >
                <Check /> Accept
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onRejectClick}
                loading={rejectInvitation.isPending}
              >
                <X /> Reject
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!pendingReject}
        onOpenChange={(open) => !open && setPendingReject(null)}
        title="Reject invitation?"
        description="You won't be able to join using this invitation after rejecting it."
        confirmLabel="Reject"
        loading={rejectInvitation.isPending}
        onConfirm={confirmReject}
      />
    </div>
  );
}
