"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmissionRow } from "@/lib/types/submission-types";
import { Form, FormField } from "@/lib/types/form-types";
import { useAction } from "next-safe-action/hooks";
import { editSubmissionAction } from "@/lib/services/actions/submission-advanced.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface SubmissionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: SubmissionRow;
  form: Form;
}

export function SubmissionEditDialog({
  open,
  onOpenChange,
  row,
  form,
}: SubmissionEditDialogProps) {
  const router = useRouter();
  const [fieldValues, setFieldValues] = useState<Record<string, any>>(
    row.fieldValues
  );

  const { execute: editSubmission, isExecuting } = useAction(
    editSubmissionAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success(data.message || "Submission updated successfully");
          onOpenChange(false);
          router.refresh();
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Failed to update submission");
      },
    }
  );

  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editSubmission({
      submissionId: row.submission.$id,
      fieldValues,
    });
  };

  const renderFieldInput = (field: FormField) => {
    const value = fieldValues[field.id];

    switch (field.type) {
      case "short_text":
      case "email":
      case "phone":
      case "url":
        return (
          <Input
            type="text"
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case "long_text":
      case "rich_text":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
          />
        );

      case "number":
      case "currency":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) =>
              handleFieldChange(field.id, parseFloat(e.target.value))
            }
            placeholder={field.placeholder}
            step={(field as any).step || "any"}
            min={(field as any).min}
            max={(field as any).max}
          />
        );

      case "date":
        return (
          <Input
            type="date"
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );

      case "datetime":
        return (
          <Input
            type="datetime-local"
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );

      case "time":
        return (
          <Input
            type="time"
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );

      case "dropdown":
      case "radio":
        return (
          <Select
            value={value || ""}
            onValueChange={(val) => handleFieldChange(field.id, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {(field as any).options?.map((option: any) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value || false}
              onCheckedChange={(checked) =>
                handleFieldChange(field.id, checked)
              }
            />
            <label className="text-sm">{field.label}</label>
          </div>
        );

      case "multi_select":
        return (
          <div className="space-y-2">
            {(field as any).options?.map((option: any) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (checked) {
                      handleFieldChange(field.id, [
                        ...currentValues,
                        option.value,
                      ]);
                    } else {
                      handleFieldChange(
                        field.id,
                        currentValues.filter((v) => v !== option.value)
                      );
                    }
                  }}
                />
                <label className="text-sm">{option.label}</label>
              </div>
            ))}
          </div>
        );

      case "rating":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) =>
              handleFieldChange(field.id, parseInt(e.target.value))
            }
            min={1}
            max={(field as any).maxRating || 5}
          />
        );

      case "scale":
        return (
          <Input
            type="range"
            value={value || (field as any).min || 0}
            onChange={(e) =>
              handleFieldChange(field.id, parseInt(e.target.value))
            }
            min={(field as any).min || 0}
            max={(field as any).max || 10}
            step={(field as any).step || 1}
            className="w-full"
          />
        );

      case "file_upload":
      case "image_upload":
        return (
          <div className="text-sm text-muted-foreground">
            File uploads cannot be edited directly. Please contact support if you
            need to modify uploaded files.
          </div>
        );

      default:
        return (
          <Input
            type="text"
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Submission</DialogTitle>
          <DialogDescription>
            Modify the form responses. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields */}
          <div className="space-y-4">
            {form.fields
              .filter(
                (f) =>
                  f.type !== "section_header" &&
                  f.type !== "divider" &&
                  f.type !== "rich_text"
              )
              .map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label}
                    {field.required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </Label>
                  {field.description && (
                    <p className="text-xs text-muted-foreground">
                      {field.description}
                    </p>
                  )}
                  {renderFieldInput(field)}
                </div>
              ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isExecuting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isExecuting}>
              {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
