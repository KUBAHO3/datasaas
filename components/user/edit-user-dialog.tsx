"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RBAC_ROLES, ROLE_DESCRIPTIONS } from "@/lib/constants/rbac-roles";
import { toast } from "sonner";
import { updateUserRoleAction, updateUserDetailsAction } from "@/app/(company)/dashboard/profile/[userId]/actions";
import { Loader2, Settings } from "lucide-react";
import { UserData } from "@/lib/types/user-types";

interface EditUserDialogProps {
  user: UserData;
  currentUserRole?: string;
  children?: React.ReactNode;
}

export function EditUserDialog({ user, currentUserRole, children }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: user.name || "",
    jobTitle: user.jobTitle || "",
    phone: user.phone || "",
    bio: user.bio || "",
    role: user.role || RBAC_ROLES.VIEWER,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      // Update role if changed
      if (formData.role !== user.role) {
        const roleResult = await updateUserRoleAction({
          userId: user.userId,
          role: formData.role as any,
        });

        if (roleResult?.data?.error) {
          toast.error(roleResult.data.error);
          return;
        }
      }

      // Update other details
      const detailsResult = await updateUserDetailsAction({
        userId: user.userId,
        name: formData.name,
        jobTitle: formData.jobTitle,
        phone: formData.phone,
        bio: formData.bio,
      });

      if (detailsResult?.data?.error) {
        toast.error(detailsResult.data.error);
      } else if (detailsResult?.data?.success) {
        toast.success("User updated successfully");
        setOpen(false);
      }
    });
  };

  // Don't allow editing if not admin/owner
  const canEdit = currentUserRole === RBAC_ROLES.OWNER || currentUserRole === RBAC_ROLES.ADMIN;

  if (!canEdit) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Edit User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions. Changes will be reflected immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Job Title */}
            <div className="grid gap-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) =>
                  setFormData({ ...formData, jobTitle: e.target.value })
                }
                placeholder="e.g., Product Manager"
              />
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Bio */}
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Brief description..."
                rows={3}
                maxLength={500}
              />
            </div>

            {/* Role */}
            <div className="grid gap-2">
              <Label htmlFor="role">Permission Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(RBAC_ROLES).map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_DESCRIPTIONS[role].label} -{" "}
                      {ROLE_DESCRIPTIONS[role].description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {currentUserRole === RBAC_ROLES.OWNER
                  ? "As an owner, you can assign any role"
                  : "You cannot assign owner roles"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
