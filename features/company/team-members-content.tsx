"use client";

import { useState, useTransition } from "react";
import { TeamMember, TeamMemberRole } from "@/lib/types/user-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Users, Shield, Edit3, Eye } from "lucide-react";
import { TeamMembersTable } from "./team-members-table";
import { PendingInvitationsTable } from "./pending-invitations-table";
import InviteMemberDialog from "./invite-member-dialog";
import EditRoleDialog from "./edit-role-dialog";
import RemoveMemberDialog from "./remove-member-dialog";
import SuspendMemberDialog from "./suspend-member-dialog";

interface TeamMembersContentProps {
    orgId: string;
    activeMembers: TeamMember[];
    pendingMembers: TeamMember[];
    stats: {
        owners: number;
        admins: number;
        editors: number;
        viewers: number;
    };
    currentUserId: string;
    currentUserRole?: string;
}

export function TeamMembersContent({
    orgId,
    activeMembers,
    pendingMembers,
    stats,
    currentUserId,
    currentUserRole,
}: TeamMembersContentProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false);
    const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
    const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
    const [suspendMode, setSuspendMode] = useState<"suspend" | "unsuspend">("suspend");
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [isPending, startTransition] = useTransition();

    // Check if user can manage members (owner or admin)
    const canManageMembers = currentUserRole === "owner" || currentUserRole === "admin";

    // Filter members based on search query
    const filteredActiveMembers = activeMembers.filter(
        (member) =>
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPendingMembers = pendingMembers.filter(
        (member) =>
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEditRole = (member: TeamMember) => {
        setSelectedMember(member);
        setEditRoleDialogOpen(true);
    };

    const handleRemoveMember = (member: TeamMember) => {
        setSelectedMember(member);
        setRemoveMemberDialogOpen(true);
    };

    const handleSuspendMember = (member: TeamMember, mode: "suspend" | "unsuspend") => {
        setSelectedMember(member);
        setSuspendMode(mode);
        setSuspendDialogOpen(true);
    };

    const handleResendInvitation = (membershipId: string, email: string) => {
        // This will be handled in the PendingInvitationsTable component
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Owners</CardTitle>
                        <Shield className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.owners}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Admins</CardTitle>
                        <Shield className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.admins}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Editors</CardTitle>
                        <Edit3 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.editors}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Viewers</CardTitle>
                        <Eye className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.viewers}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 max-w-sm">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search members..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
                {canManageMembers && (
                    <Button onClick={() => setInviteDialogOpen(true)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite Member
                    </Button>
                )}
            </div>

            {/* Active Members Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Active Members ({filteredActiveMembers.length})
                    </CardTitle>
                    <CardDescription>
                        Team members who have accepted their invitations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TeamMembersTable
                        members={filteredActiveMembers}
                        currentUserId={currentUserId}
                        canManageMembers={canManageMembers}
                        onEditRole={handleEditRole}
                        onRemoveMember={handleRemoveMember}
                        onSuspendMember={handleSuspendMember}
                    />
                </CardContent>
            </Card>

            {/* Pending Invitations */}
            {canManageMembers && pendingMembers.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Invitations ({filteredPendingMembers.length})</CardTitle>
                        <CardDescription>
                            Team members who haven't accepted their invitations yet
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PendingInvitationsTable
                            members={filteredPendingMembers}
                            orgId={orgId}
                            onRemove={handleRemoveMember}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Dialogs */}
            {inviteDialogOpen && (
                <InviteMemberDialog
                    orgId={orgId}
                    open={inviteDialogOpen}
                    onOpenChange={setInviteDialogOpen}
                />
            )}

            {editRoleDialogOpen && selectedMember && (
                <EditRoleDialog
                    orgId={orgId}
                    member={selectedMember}
                    open={editRoleDialogOpen}
                    onOpenChange={setEditRoleDialogOpen}
                />
            )}

            {removeMemberDialogOpen && selectedMember && (
                <RemoveMemberDialog
                    orgId={orgId}
                    member={selectedMember}
                    open={removeMemberDialogOpen}
                    onOpenChange={setRemoveMemberDialogOpen}
                    currentUserId={currentUserId}
                />
            )}

            {suspendDialogOpen && selectedMember && (
                <SuspendMemberDialog
                    orgId={orgId}
                    member={selectedMember}
                    open={suspendDialogOpen}
                    onOpenChange={setSuspendDialogOpen}
                    mode={suspendMode}
                />
            )}
        </div>
    );
}
