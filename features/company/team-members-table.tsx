"use client"

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UserData } from "@/lib/types/user-types";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface TeamMembersTableProps {
    members: UserData[];
}

export function TeamMembersTable({ members }: TeamMembersTableProps) {
    const getRoleBadge = (role?: string) => {
        if (!role) return null;

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

    return (
        <Card>
            <CardContent className="p-0">
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
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {members.map((member) => (
                                <tr
                                    key={member.$id}
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
                                                <span className="font-medium">{member.name}</span>
                                                {member.bio && (
                                                    <span className="text-xs text-muted-foreground line-clamp-1">
                                                        {member.bio}
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
                                        {format(new Date(member.$createdAt), "MMM d, yyyy")}
                                    </td>
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
                                                    <DropdownMenuItem>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Role
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Mail className="mr-2 h-4 w-4" />
                                                        Resend Invitation
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Remove Member
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t px-6 py-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {members.length} team member{members.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}