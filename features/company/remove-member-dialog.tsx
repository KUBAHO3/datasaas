"use client";

import { useTransition } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { removeMember } from "@/lib/services/actions/team-members.actions";
import { Loader2, AlertTriangle, UserX } from "lucide-react";

interface RemoveMemberDialogProps {
    orgId: string;
    member: TeamMember;
    currentUserId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function RemoveMemberDialog({
    orgId,
    member,
    currentUserId,
    open,
    onOpenChange,
}: RemoveMemberDialogProps) {
    const [isPending, startTransition] = useTransition();

    const isPendingInvitation = !member.confirmed;
    const actionText = isPendingInvitation ? "Cancel Invitation" : "Remove Member";
    const confirmationText = isPendingInvitation
        ? "cancel this invitation"
        : "remove this member from your team";

    const handleRemove = () => {
        if (!member.userId && !isPendingInvitation) {
            toast.error("Cannot remove member without user ID");
            return;
        }

        startTransition(async () => {
            try {
                const result = await removeMember({
                    membershipId: member.membershipId,
                    companyId: orgId,
                    userId: member.userId || "pending",
                });

                if (result?.data?.success) {
                    toast.success(result.data.message || `${actionText} successful`);
                    onOpenChange(false);
                } else {
                    toast.error(`Failed to ${confirmationText}`);
                }
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : `An error occurred while trying to ${confirmationText}`
                );
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <UserX className="h-5 w-5" />
                        {actionText}
                    </DialogTitle>
                    <DialogDescription>
                        {isPendingInvitation
                            ? "This will cancel the pending invitation."
                            : "This action will remove the member from your organization."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            {isPendingInvitation ? (
                                <>
                                    You are about to cancel the invitation for <strong>{member.email}</strong>.
                                    They will no longer be able to join using their existing invitation link.
                                </>
                            ) : (
                                <>
                                    You are about to remove <strong>{member.name}</strong> ({member.email}) from your team.
                                    They will lose access to all team data and resources.
                                </>
                            )}
                        </AlertDescription>
                    </Alert>

                    {!isPendingInvitation && (
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
                    )}

                    {member.role === "owner" && (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Warning:</strong> You are removing an owner. Make sure there is at least
                                one other owner in the organization to maintain administrative access.
                            </AlertDescription>
                        </Alert>
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
                        variant="destructive"
                        onClick={handleRemove}
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

export default RemoveMemberDialog;
