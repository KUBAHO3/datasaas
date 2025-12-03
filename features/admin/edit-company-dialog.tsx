"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";

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
import { Textarea } from "@/components/ui/textarea";
import {
  updateCompanySchema,
  UpdateCompanyInput,
} from "@/lib/schemas/company-schemas";
import { updateCompanyAction } from "@/lib/services/actions/company.actions";
import { Company } from "@/lib/types/company-types";
import { Label } from "@/components/ui/label";

interface EditCompanyDialogProps {
  company: Company;
}

export default function EditCompanyDialog({ company }: EditCompanyDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<UpdateCompanyInput>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: {
      companyId: company.$id,
      companyName: company.companyName || "",
      industry: company.industry || "",
      size: company.size || "",
      website: company.website || "",
      phone: company.phone || "",
      description: company.description || "",
      street: company.address || "",
      city: company.city || "",
      state: company.state || "",
      country: company.country || "",
      zipCode: company.zipCode || "",
    },
  });

  const { execute, status } = useAction(updateCompanyAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message || "Company updated successfully");
        setOpen(false);
        form.reset();
      } else if (data?.error) {
        toast.error(data.error);
      }
    },
    onError: () => {
      toast.error("Failed to update company");
    },
  });

  const onSubmit = (data: UpdateCompanyInput) => {
    execute(data);
  };

  const isLoading = status === "executing";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>
            Update company information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Basic Information</h3>

            <Field>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Acme Corporation"
                {...form.register("companyName")}
              />
              <FieldError>{form.formState.errors.companyName?.message}</FieldError>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="Technology"
                  {...form.register("industry")}
                />
                <FieldError>{form.formState.errors.industry?.message}</FieldError>
              </Field>

              <Field>
                <Label htmlFor="size">Company Size</Label>
                <Input
                  id="size"
                  placeholder="50-200"
                  {...form.register("size")}
                />
                <FieldError>{form.formState.errors.size?.message}</FieldError>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://example.com"
                  {...form.register("website")}
                />
                <FieldError>{form.formState.errors.website?.message}</FieldError>
              </Field>

              <Field>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  {...form.register("phone")}
                />
                <FieldError>{form.formState.errors.phone?.message}</FieldError>
              </Field>
            </div>

            <Field>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the company"
                rows={3}
                {...form.register("description")}
              />
              <FieldError>{form.formState.errors.description?.message}</FieldError>
            </Field>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Address</h3>

            <Field>
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                placeholder="123 Main Street"
                {...form.register("street")}
              />
              <FieldError>{form.formState.errors.street?.message}</FieldError>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="San Francisco"
                  {...form.register("city")}
                />
                <FieldError>{form.formState.errors.city?.message}</FieldError>
              </Field>

              <Field>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  placeholder="California"
                  {...form.register("state")}
                />
                <FieldError>{form.formState.errors.state?.message}</FieldError>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="United States"
                  {...form.register("country")}
                />
                <FieldError>{form.formState.errors.country?.message}</FieldError>
              </Field>

              <Field>
                <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                <Input
                  id="zipCode"
                  placeholder="94102"
                  {...form.register("zipCode")}
                />
                <FieldError>{form.formState.errors.zipCode?.message}</FieldError>
              </Field>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}