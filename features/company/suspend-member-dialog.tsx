"use client";

import { useState, useTransition } from "react";
import { TeamMember } from "@/lib/types/user-types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { suspendMember, unsuspendMember } from "@/lib/services/actions/team-members.actions";
import { Loader2, Ban, AlertTriangle } from "lucide-react";

interface SuspendMemberDialogProps {
    orgId: string;
    member: TeamMember;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "suspend" | "unsuspend";
}

function SuspendMemberDialog({
    orgId,
    member,
    open,
    onOpenChange,
    mode,
}: SuspendMemberDialogProps) {
    const [reason, setReason] = useState("");
    const [isPending, startTransition] = useTransition();

    const isSuspend = mode === "suspend";
    const actionText = isSuspend ? "Suspend Member" : "Unsuspend Member";
    const actionVerb = isSuspend ? "suspend" : "unsuspend";

    const handleAction = () => {
        if (!member.userId) {
            toast.error("Cannot suspend member without user ID");
            return;
        }

        startTransition(async () => {
            try {
                const action = isSuspend ? suspendMember : unsuspendMember;
                const payload: any = {
                    membershipId: member.membershipId,
                    companyId: orgId,
                    userId: member.userId!,
                };

                if (isSuspend && reason) {
                    payload.reason = reason;
                }

                const result = await action(payload);

                if (result?.data?.success) {
                    toast.success(result.data.message || `Member ${actionVerb}ed successfully`);
                    onOpenChange(false);
                } else {
                    toast.error(`Failed to ${actionVerb} member`);
                }
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : `An error occurred while trying to ${actionVerb} member`
                );
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Ban className="h-5 w-5" />
                        {actionText}
                    </DialogTitle>
                    <DialogDescription>
                        {isSuspend
                            ? "Temporarily block this member from accessing the organization"
                            : "Restore access for this member"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Alert variant={isSuspend ? "destructive" : "default"}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            {isSuspend ? (
                                <>
                                    <strong>{member.name}</strong> will be temporarily blocked from
                                    accessing the organization. Their data will remain intact and you
                                    can unsuspend them at any time.
                                </>
                            ) : (
                                <>
                                    <strong>{member.name}</strong> will regain full access to the
                                    organization according to their role.
                                </>
                            )}
                        </AlertDescription>
                    </Alert>

                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Member:</span>
                            <span className="font-medium">{member.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span className="font-medium">{member.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Role:</span>
                            <span className="font-medium capitalize">{member.role}</span>
                        </div>
                    </div>

                    {isSuspend && (
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason (Optional)</Label>
                            <Textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Enter reason for suspension..."
                                rows={3}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant={isSuspend ? "destructive" : "default"}
                        onClick={handleAction}
                        disabled={isPending}
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {actionText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default SuspendMemberDialog;
