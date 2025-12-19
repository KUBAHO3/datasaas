"use client";

import { useState, useTransition, useEffect } from "react";
import { TeamMember, TeamMemberRole } from "@/lib/types/user-types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { updateMemberRole } from "@/lib/services/actions/team-members.actions";
import { Loader2, Shield, AlertCircle } from "lucide-react";

interface EditRoleDialogProps {
    orgId: string;
    member: TeamMember;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function EditRoleDialog({
    orgId,
    member,
    open,
    onOpenChange,
}: EditRoleDialogProps) {
    const [selectedRole, setSelectedRole] = useState<TeamMemberRole>(member.role);
    const [isPending, startTransition] = useTransition();
    const [showOwnerWarning, setShowOwnerWarning] = useState(false);

    useEffect(() => {
        setSelectedRole(member.role);
        setShowOwnerWarning(selectedRole === "owner" && member.role !== "owner");
    }, [member.role, selectedRole]);

    const handleRoleChange = (role: TeamMemberRole) => {
        setSelectedRole(role);
        setShowOwnerWarning(role === "owner" && member.role !== "owner");
    };

    const handleSubmit = () => {
        if (selectedRole === member.role) {
            toast.info("No changes made");
            onOpenChange(false);
            return;
        }

        startTransition(async () => {
            try {
                const result = await updateMemberRole({
                    membershipId: member.membershipId,
                    companyId: orgId,
                    role: selectedRole,
                });

                if (result?.data?.success) {
                    toast.success(result.data.message || "Role updated successfully");
                    onOpenChange(false);
                } else {
                    toast.error("Failed to update role");
                }
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "An error occurred while updating the role"
                );
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Edit Member Role
                    </DialogTitle>
                    <DialogDescription>
                        Change the role for {member.name} ({member.email})
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <RadioGroup
                            value={selectedRole}
                            onValueChange={(value) => handleRoleChange(value as TeamMemberRole)}
                        >
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent cursor-pointer">
                                    <RadioGroupItem value="viewer" id="viewer" />
                                    <Label htmlFor="viewer" className="flex-1 cursor-pointer">
                                        <div className="flex flex-col">
                                            <span className="font-medium">Viewer</span>
                                            <span className="text-xs text-muted-foreground">
                                                Can view data only
                                            </span>
                                        </div>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent cursor-pointer">
                                    <RadioGroupItem value="editor" id="editor" />
                                    <Label htmlFor="editor" className="flex-1 cursor-pointer">
                                        <div className="flex flex-col">
                                            <span className="font-medium">Editor</span>
                                            <span className="text-xs text-muted-foreground">
                                                Can create and edit data
                                            </span>
                                        </div>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent cursor-pointer">
                                    <RadioGroupItem value="admin" id="admin" />
                                    <Label htmlFor="admin" className="flex-1 cursor-pointer">
                                        <div className="flex flex-col">
                                            <span className="font-medium">Admin</span>
                                            <span className="text-xs text-muted-foreground">
                                                Can manage users, forms, and data
                                            </span>
                                        </div>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent cursor-pointer">
                                    <RadioGroupItem value="owner" id="owner" />
                                    <Label htmlFor="owner" className="flex-1 cursor-pointer">
                                        <div className="flex flex-col">
                                            <span className="font-medium">Owner</span>
                                            <span className="text-xs text-muted-foreground">
                                                Full control over the organization
                                            </span>
                                        </div>
                                    </Label>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>

                    {showOwnerWarning && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Warning:</strong> Assigning the Owner role grants full administrative
                                control over the organization, including the ability to remove other owners.
                            </AlertDescription>
                        </Alert>
                    )}

                    {member.role === "owner" && selectedRole !== "owner" && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Note:</strong> You are about to remove owner privileges from this member.
                                Make sure there is at least one other owner in the organization.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Current Role:</span>
                            <span className="font-medium capitalize">{member.role}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">New Role:</span>
                            <span className="font-medium capitalize">{selectedRole}</span>
                        </div>
                    </div>
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
                        onClick={handleSubmit}
                        disabled={isPending || selectedRole === member.role}
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Role
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default EditRoleDialog;
