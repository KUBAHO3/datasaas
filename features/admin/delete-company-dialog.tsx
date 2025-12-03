"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  deleteCompanySchema,
  DeleteCompanyInput,
} from "@/lib/schemas/company-schemas";
import { deleteCompanyAction } from "@/lib/services/actions/company.actions";
import { Company } from "@/lib/types/company-types";
import { Label } from "@/components/ui/label";

interface DeleteCompanyDialogProps {
  company: Company;
  redirectAfterDelete?: boolean;
}

export default function DeleteCompanyDialog({
  company,
  redirectAfterDelete = false,
}: DeleteCompanyDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<DeleteCompanyInput>({
    resolver: zodResolver(deleteCompanySchema),
    defaultValues: {
      companyId: company.$id,
      confirmationText: "",
    },
  });

  const { execute, status } = useAction(deleteCompanyAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message || "Company deleted successfully");
        setOpen(false);
        form.reset();
        if (redirectAfterDelete) {
          router.push("/admin/companies");
        }
      } else if (data?.error) {
        toast.error(data.error);
      }
    },
    onError: () => {
      toast.error("Failed to delete company");
    },
  });

  const onSubmit = (data: DeleteCompanyInput) => {
    execute(data);
  };

  const isLoading = status === "executing";
  const canDelete = company.status !== "active";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={!canDelete}
          title={
            !canDelete ? "Cannot delete active companies" : "Delete company"
          }
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Company
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            company and all associated data.
          </DialogDescription>
        </DialogHeader>

        {company.status === "active" && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Cannot delete active companies. Please suspend the company first
              for safety reasons.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="text-sm">
              <span className="font-medium">Company Name:</span>{" "}
              {company.companyName}
            </div>
            <div className="text-sm">
              <span className="font-medium">Status:</span>{" "}
              <span
                className={
                  company.status === "active"
                    ? "text-green-600"
                    : company.status === "suspended"
                      ? "text-orange-600"
                      : "text-red-600"
                }
              >
                {company.status}
              </span>
            </div>
            {company.teamId && (
              <div className="text-sm">
                <span className="font-medium">Team ID:</span> {company.teamId}
              </div>
            )}
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p className="font-medium">This will delete:</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>Company account and profile</li>
                <li>Associated Appwrite team</li>
                <li>All team memberships</li>
                <li>Company settings and preferences</li>
              </ul>
            </AlertDescription>
          </Alert>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Field>
              <Label htmlFor="confirmationText">
                Type <code className="text-destructive">DELETE</code> to confirm
              </Label>
              <Input
                id="confirmationText"
                placeholder="DELETE"
                className="font-mono"
                autoComplete="off"
                {...form.register("confirmationText")}
              />
              <FieldError>
                {form.formState.errors.confirmationText?.message}
              </FieldError>
            </Field>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isLoading}
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete Company
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}