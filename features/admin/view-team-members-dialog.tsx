"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Mail, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getCompanyById } from "@/lib/services/actions/company.actions";
import { UserData } from "@/lib/types/user-types";

interface ViewTeamMembersDialogProps {
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ViewTeamMembersDialog({
  companyId,
  open,
  onOpenChange,
}: ViewTeamMembersDialogProps) {
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<UserData[]>([]);

  useEffect(() => {
    if (open) {
      loadTeamMembers();
    }
  }, [open, companyId]);

  async function loadTeamMembers() {
    setLoading(true);
    try {
      const result = await getCompanyById(companyId);
      if (result) {
        setTeamMembers(result.teamMembers);
      }
    } catch (error) {
      console.error("Failed to load team members:", error);
    } finally {
      setLoading(false);
    }
  }

  const getRoleBadge = (role?: string) => {
    if (!role) return null;

    const roleColors = {
      owner:
        "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      admin: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      editor:
        "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      viewer:
        "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
    };

    return (
      <Badge
        variant="outline"
        className={
          roleColors[role as keyof typeof roleColors] || roleColors.viewer
        }
      >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Team Members</DialogTitle>
          <DialogDescription>
            View all team members for this company
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No team members found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div
                key={member.$id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
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
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{member.email}</span>
                    </div>
                  </div>
                </div>

                {getRoleBadge(member.role)}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}