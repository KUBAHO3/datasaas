"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SubmissionRow } from "@/lib/types/submission-types";
import { Form } from "@/lib/types/form-types";
import { SubmissionHelpers } from "@/lib/utils/submission-utils";
import { format } from "date-fns";
import { CheckCircle, Clock, Calendar, User, Mail } from "lucide-react";

interface SubmissionViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: SubmissionRow;
  form: Form;
}

export function SubmissionViewDialog({
  open,
  onOpenChange,
  row,
  form,
}: SubmissionViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submission Details</DialogTitle>
          <DialogDescription>
            View complete submission information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Metadata */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Submission Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {row.submission.status === "completed" ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Completed
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Draft
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                ID: {row.submission.$id}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {row.submission.submittedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Submitted</div>
                    <div className="text-muted-foreground">
                      {format(new Date(row.submission.submittedAt), "PPp")}
                    </div>
                  </div>
                </div>
              )}

              {(row.submission.submittedByEmail || row.submission.submittedBy) && (
                <div className="flex items-center gap-2">
                  {row.submission.submittedByEmail ? (
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <div className="font-medium">Submitted By</div>
                    <div className="text-muted-foreground">
                      {row.submission.submittedByEmail ||
                        row.submission.submittedBy ||
                        "Anonymous"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Field Values */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Form Responses</h3>
            <div className="space-y-4">
              {form.fields.map((field) => {
                const value = row.fieldValues[field.id];
                const hasValue = value !== null && value !== undefined;

                return (
                  <div
                    key={field.id}
                    className="border-l-2 border-muted pl-4 py-2"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="font-medium text-sm">{field.label}</div>
                        {field.description && (
                          <div className="text-xs text-muted-foreground">
                            {field.description}
                          </div>
                        )}
                        <div className="text-sm">
                          {hasValue ? (
                            SubmissionHelpers.formatFieldValue(value, field.type)
                          ) : (
                            <span className="text-muted-foreground italic">
                              No response
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {field.type}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}