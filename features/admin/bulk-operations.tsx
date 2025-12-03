"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    bulkApproveCompaniesAction,
    bulkRejectCompaniesAction,
} from "@/lib/services/actions/company.actions";
import { Label } from "@/components/ui/label";

interface BulkOperationsProps {
    selectedCompanyIds: string[];
    onComplete: () => void;
}

const rejectReasonSchema = z.object({
    reason: z.string().min(10, "Reason must be at least 10 characters"),
});

type RejectReasonForm = z.infer<typeof rejectReasonSchema>;

export function BulkOperations({
    selectedCompanyIds,
    onComplete,
}: BulkOperationsProps) {
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

    const rejectForm = useForm<RejectReasonForm>({
        resolver: zodResolver(rejectReasonSchema),
        defaultValues: {
            reason: "",
        },
    });

    const { execute: executeApprove, status: approveStatus } = useAction(
        bulkApproveCompaniesAction,
        {
            onSuccess: ({ data }) => {
                if (data?.success && data?.results) {
                    toast.success(data.message || "Bulk approval completed");
                    if (data.results.failed.length > 0) {
                        toast.warning(
                            `${data.results.failed.length} companies failed to approve`
                        );
                    }
                    setApproveDialogOpen(false);
                    onComplete();
                } else if (data?.error) {
                    toast.error(data.error);
                }
            },
            onError: () => {
                toast.error("Failed to approve companies");
            },
        }
    );

    const { execute: executeReject, status: rejectStatus } = useAction(
        bulkRejectCompaniesAction,
        {
            onSuccess: ({ data }) => {
                if (data?.success && data?.results) {
                    toast.success(data.message || "Bulk rejection completed");
                    if (data.results.failed.length > 0) {
                        toast.warning(
                            `${data.results.failed.length} companies failed to reject`
                        );
                    }
                    setRejectDialogOpen(false);
                    rejectForm.reset();
                    onComplete();
                } else if (data?.error) {
                    toast.error(data.error);
                }
            },
            onError: () => {
                toast.error("Failed to reject companies");
            },
        }
    );

    const handleBulkApprove = () => {
        executeApprove({ companyIds: selectedCompanyIds });
    };

    const handleBulkReject = (data: RejectReasonForm) => {
        executeReject({
            companyIds: selectedCompanyIds,
            reason: data.reason,
        });
    };

    const isApproving = approveStatus === "executing";
    const isRejecting = rejectStatus === "executing";

    if (selectedCompanyIds.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-2 p-4 bg-muted/50 border rounded-lg">
            <div className="flex-1 text-sm">
                <span className="font-medium">{selectedCompanyIds.length}</span>{" "}
                {selectedCompanyIds.length === 1 ? "company" : "companies"} selected
            </div>

            <div className="flex gap-2">
                <Button
                    variant="default"
                    size="sm"
                    onClick={() => setApproveDialogOpen(true)}
                >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Bulk Approve
                </Button>

                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setRejectDialogOpen(true)}
                >
                    <XCircle className="h-4 w-4 mr-2" />
                    Bulk Reject
                </Button>

                <Button variant="outline" size="sm" onClick={onComplete}>
                    Clear Selection
                </Button>
            </div>

            {/* Approve Dialog */}
            <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Approve Companies</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve {selectedCompanyIds.length}{" "}
                            {selectedCompanyIds.length === 1 ? "company" : "companies"}?
                        </DialogDescription>
                    </DialogHeader>

                    <Alert>
                        <AlertDescription>
                            This will:
                            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                                <li>Create Appwrite teams for each company</li>
                                <li>Set all companies to "active" status</li>
                                <li>Send approval emails to company owners</li>
                                <li>Grant access to the platform</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setApproveDialogOpen(false)}
                            disabled={isApproving}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleBulkApprove} disabled={isApproving}>
                            {isApproving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Approve {selectedCompanyIds.length}{" "}
                            {selectedCompanyIds.length === 1 ? "Company" : "Companies"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Reject Companies</DialogTitle>
                        <DialogDescription>
                            Provide a reason for rejecting {selectedCompanyIds.length}{" "}
                            {selectedCompanyIds.length === 1 ? "company" : "companies"}.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={rejectForm.handleSubmit(handleBulkReject)}
                        className="space-y-4"
                    >
                        <Field>
                            <Label htmlFor="reason">Rejection Reason *</Label>
                            <Textarea
                                id="reason"
                                placeholder="Please provide a detailed reason for rejection..."
                                rows={4}
                                {...rejectForm.register("reason")}
                            />
                            <FieldError>
                                {rejectForm.formState.errors.reason?.message}
                            </FieldError>
                        </Field>

                        <Alert variant="destructive">
                            <AlertDescription>
                                This will:
                                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                                    <li>Set all companies to "rejected" status</li>
                                    <li>Send rejection emails with your reason</li>
                                    <li>Deny platform access</li>
                                    <li>Companies can reapply with updated information later</li>
                                </ul>
                            </AlertDescription>
                        </Alert>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setRejectDialogOpen(false)}
                                disabled={isRejecting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={isRejecting}
                            >
                                {isRejecting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Reject {selectedCompanyIds.length}{" "}
                                {selectedCompanyIds.length === 1 ? "Company" : "Companies"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}