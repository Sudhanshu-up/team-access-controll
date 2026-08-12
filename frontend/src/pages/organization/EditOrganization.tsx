import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useOrganization, useUpdateOrganization } from "@/hooks/useOrganizations";
import { parseApiError } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/common/QueryState";

// Mirrors backend's updateOrganizationValidator exactly (both fields optional).
const schema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Organization name must be between 3 and 100 characters")
    .max(100, "Organization name must be between 3 and 100 characters")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function EditOrganization() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: organization, isLoading, isError, error, refetch } =
    useOrganization(id);
  const updateOrganization = useUpdateOrganization(id ?? "");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (organization) {
      reset({
        name: organization.name,
        description: organization.description ?? "",
      });
    }
  }, [organization, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!id) return;
    try {
      await updateOrganization.mutateAsync({
        name: values.name || undefined,
        description: values.description,
      });
      toast.success("Organization updated");
      navigate(`/organizations/${id}`);
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  if (isLoading) return <LoadingState label="Loading organization..." />;
  if (isError)
    return <ErrorState message={parseApiError(error).message} onRetry={() => refetch()} />;
  if (!organization) return null;

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Edit organization</CardTitle>
          <CardDescription>Update this organization's details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" invalid={!!errors.name} {...register("name")} />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                invalid={!!errors.description}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button type="submit" loading={isSubmitting}>
                Save changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/organizations/${id}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
