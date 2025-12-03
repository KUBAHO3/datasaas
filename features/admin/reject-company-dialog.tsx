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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Company } from "@/lib/types/company-types";
import { useState } from "react";
import { rejectCompanyAction } from "@/lib/services/actions/company.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RejectCompanyDialogProps {
    company: Company;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function RejectCompanyDialog({
    company,
    open,
    onOpenChange,
}: RejectCompanyDialogProps) {
    const router = useRouter();
    const [rejectionReason, setRejectionReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleReject() {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await rejectCompanyAction({
                companyId: company.$id,
                reason: rejectionReason,
            });

            if (result?.data?.success) {
                toast.success(result.data.message);
                onOpenChange(false);
                setRejectionReason("");
                router.refresh();
            } else if (result?.serverError) {
                toast.error(result.serverError);
            }
        } catch (error) {
            toast.error("Failed to reject company");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reject Company Application</DialogTitle>
                    <DialogDescription>
                        Please provide a reason for rejecting {company.companyName}&apos;s
                        application. This will be sent to the company owner via email.
                    </DialogDescription>
                </DialogHeader>

                <Field>
                    <FieldLabel>Rejection Reason</FieldLabel>
                    <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter the reason for rejection..."
                        rows={4}
                        disabled={isSubmitting}
                    />
                    {!rejectionReason.trim() && (
                        <FieldError>Rejection reason is required</FieldError>
                    )}
                </Field>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isSubmitting || !rejectionReason.trim()}
                    >
                        {isSubmitting ? "Rejecting..." : "Reject Application"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}