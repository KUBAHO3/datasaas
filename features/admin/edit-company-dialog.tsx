"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Company } from "@/lib/types/company-types";
import { useState } from "react";
import { updateCompanyAction } from "@/lib/services/actions/company.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface EditCompanyDialogProps {
  company: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditCompanyDialog({
  company,
  open,
  onOpenChange,
}: EditCompanyDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: company.companyName || "",
    email: company.email || "",
    phone: company.phone || "",
    website: company.website || "",
    industry: company.industry || "",
    description: company.description || "",
  });

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!formData.companyName.trim() || !formData.email.trim()) {
      toast.error("Company name and email are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateCompanyAction({
        companyId: company.$id,
        ...formData,
      });

      if (result?.data?.success) {
        toast.success(result.data.message);
        onOpenChange(false);
        router.refresh();
      } else if (result?.serverError) {
        toast.error(result.serverError);
      }
    } catch (error) {
      toast.error("Failed to update company");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>
            Update company information for {company.companyName}
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <div className="grid md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Company Name *</FieldLabel>
              <Input
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                disabled={isSubmitting}
              />
            </Field>

            <Field>
              <FieldLabel>Email *</FieldLabel>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={isSubmitting}
              />
            </Field>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Phone</FieldLabel>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                disabled={isSubmitting}
              />
            </Field>

            <Field>
              <FieldLabel>Website</FieldLabel>
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                disabled={isSubmitting}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel>Industry</FieldLabel>
            <Input
              value={formData.industry}
              onChange={(e) => handleChange("industry", e.target.value)}
              disabled={isSubmitting}
            />
          </Field>

          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}