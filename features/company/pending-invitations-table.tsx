"use client";

import { useState, useTransition } from "react";
import { TeamMember } from "@/lib/types/user-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreVertical,
    Mail,
    MailCheck,
    Trash2,
    Clock,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { resendInvitation } from "@/lib/services/actions/team-members.actions";

interface PendingInvitationsTableProps {
    members: TeamMember[];
    orgId: string;
    onRemove: (member: TeamMember) => void;
}

export function PendingInvitationsTable({
    members,
    orgId,
    onRemove,
}: PendingInvitationsTableProps) {
    const [isPending, startTransition] = useTransition();
    const [resendingId, setResendingId] = useState<string | null>(null);

    const handleResendInvitation = (membershipId: string, email: string) => {
        setResendingId(membershipId);
        startTransition(async () => {
            try {
                const result = await resendInvitation({
                    membershipId,
                    companyId: orgId,
                    email,
                });

                if (result?.data?.success) {
                    toast.success(result.data.message || "Invitation resent successfully");
                } else {
                    toast.error("Failed to resend invitation");
                }
            } catch (error) {
                toast.error("An error occurred while resending the invitation");
            } finally {
                setResendingId(null);
            }
        });
    };

    const getRoleBadge = (role: string) => {
        const roleColors = {
            owner: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
            admin: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
            editor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
            viewer: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
        };

        return (
            <Badge
                variant="outline"
                className={roleColors[role as keyof typeof roleColors] || roleColors.viewer}
            >
                {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
        );
    };

    if (members.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No pending invitations
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b bg-muted/50">
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Invited
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {members.map((member) => {
                        const isResending = resendingId === member.membershipId;

                        return (
                            <tr
                                key={member.membershipId}
                                className="hover:bg-muted/50 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{member.email}</span>
                                            {member.name && member.name !== "Pending" && (
                                                <span className="text-xs text-muted-foreground">
                                                    {member.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {getRoleBadge(member.role)}
                                </td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                    {format(new Date(member.invited), "MMM d, yyyy")}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                                        <Clock className="mr-1 h-3 w-3" />
                                        Pending
                                    </Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleResendInvitation(member.membershipId, member.email)}
                                            disabled={isResending}
                                        >
                                            <MailCheck className="mr-2 h-4 w-4" />
                                            {isResending ? "Sending..." : "Resend"}
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleResendInvitation(member.membershipId, member.email)}
                                                    disabled={isResending}
                                                >
                                                    <MailCheck className="mr-2 h-4 w-4" />
                                                    Resend Invitation
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => onRemove(member)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Cancel Invitation
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="flex items-center justify-between border-t px-6 py-4">
                <p className="text-sm text-muted-foreground">
                    {members.length} pending invitation{members.length !== 1 ? "s" : ""}
                </p>
            </div>
        </div>
    );
}
