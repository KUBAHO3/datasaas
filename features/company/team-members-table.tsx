"use client";

import { Badge } from "@/components/ui/badge";
import { TeamMember } from "@/lib/types/user-types";
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
    UserCircle,
    Mail,
    Shield,
    Edit,
    Trash2,
    Ban,
    CheckCircle,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { getProfileLink } from "@/lib/utils/profile-utils";
import Link from "next/link";

interface TeamMembersTableProps {
    members: TeamMember[];
    currentUserId: string;
    canManageMembers: boolean;
    onEditRole: (member: TeamMember) => void;
    onRemoveMember: (member: TeamMember) => void;
    onSuspendMember: (member: TeamMember, mode: "suspend" | "unsuspend") => void;
}

export function TeamMembersTable({
    members,
    currentUserId,
    canManageMembers,
    onEditRole,
    onRemoveMember,
    onSuspendMember,
}: TeamMembersTableProps) {
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

    const isCurrentUser = (userId: string | null) => userId === currentUserId;

    if (members.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No team members found
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b bg-muted/50">
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Joined
                        </th>
                        {canManageMembers && (
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {members.map((member) => {
                        const isSelf = isCurrentUser(member.userId);

                        return (
                            <tr
                                key={member.membershipId}
                                className="hover:bg-muted/50 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                            {member.avatar ? (
                                                <img
                                                    src={member.avatar}
                                                    alt={member.name}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <UserCircle className="h-6 w-6 text-primary" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{member.name}</span>
                                                {isSelf && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        You
                                                    </Badge>
                                                )}
                                                {member.suspended && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Suspended
                                                    </Badge>
                                                )}
                                            </div>
                                            {member.jobTitle && (
                                                <span className="text-xs text-muted-foreground">
                                                    {member.jobTitle}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{member.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {getRoleBadge(member.role)}
                                </td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                    {member.joined ? format(new Date(member.joined), "MMM d, yyyy") : "Pending"}
                                </td>
                                {canManageMembers && (
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {member.userId && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={getProfileLink(member.userId)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Profile
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        onClick={() => onEditRole(member)}
                                                        disabled={isSelf}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Role
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {member.suspended ? (
                                                        <DropdownMenuItem
                                                            onClick={() => onSuspendMember(member, "unsuspend")}
                                                            disabled={isSelf}
                                                        >
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Unsuspend Member
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            onClick={() => onSuspendMember(member, "suspend")}
                                                            disabled={isSelf}
                                                        >
                                                            <Ban className="mr-2 h-4 w-4" />
                                                            Suspend Member
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => onRemoveMember(member)}
                                                        disabled={isSelf}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Remove Member
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="flex items-center justify-between border-t px-6 py-4">
                <p className="text-sm text-muted-foreground">
                    Showing {members.length} team member{members.length !== 1 ? "s" : ""}
                </p>
            </div>
        </div>
    );
}