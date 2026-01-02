import { UserData } from "@/lib/types/user-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRoleBadge } from "./user-role-badge";
import { UserStatusBadge } from "./user-status-badge";
import { EditUserDialog } from "./edit-user-dialog";
import { SuspendUserDialog } from "./suspend-user-dialog";
import { Button } from "@/components/ui/button";
import {
  User2,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Shield,
  AlertCircle,
} from "lucide-react";
import { RBAC_ROLES, hasMinimumRole } from "@/lib/constants/rbac-roles";
import { format } from "date-fns";

interface UserProfileViewProps {
  user: UserData;
  viewerUserId: string;
  viewerRole?: string;
  isOwnProfile: boolean;
}

export function UserProfileView({
  user,
  viewerUserId,
  viewerRole,
  isOwnProfile,
}: UserProfileViewProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Permission checks
  const canEdit = !isOwnProfile && (viewerRole === RBAC_ROLES.OWNER || viewerRole === RBAC_ROLES.ADMIN);
  const canViewSensitive = isOwnProfile || canEdit;
  const canViewEmail = canViewSensitive || hasMinimumRole(viewerRole, RBAC_ROLES.EDITOR);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <CardDescription className="mt-1">
                  {user.jobTitle || "No job title set"}
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <UserRoleBadge role={user.role} />
                  <UserStatusBadge suspended={user.suspended} />
                </div>
              </div>
            </div>

            {/* Action Buttons - Only for admins/owners viewing others */}
            {canEdit && (
              <div className="flex items-center gap-2">
                <EditUserDialog user={user} currentUserRole={viewerRole} />
                <SuspendUserDialog
                  userId={user.userId}
                  userName={user.name}
                  isSuspended={user.suspended}
                  currentUserRole={viewerRole}
                />
              </div>
            )}

            {/* Edit Own Profile Button */}
            {isOwnProfile && (
              <Button asChild variant="outline">
                <a href="/dashboard/profile">Edit Profile</a>
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Suspension Warning */}
      {user.suspended && (
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <CardTitle>Account Suspended</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {user.suspendedReason && (
                <p>
                  <strong>Reason:</strong> {user.suspendedReason}
                </p>
              )}
              {user.suspendedAt && (
                <p>
                  <strong>Suspended on:</strong>{" "}
                  {format(new Date(user.suspendedAt), "PPP 'at' p")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User2 className="h-5 w-5 text-primary" />
            <CardTitle>Contact Information</CardTitle>
          </div>
          <CardDescription>
            {isOwnProfile
              ? "Your contact details"
              : canViewSensitive
              ? "User contact details"
              : "Limited contact information"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email - visible to editors and above, or own profile */}
          {canViewEmail && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )}

          {/* Phone - visible to admins/owners or own profile */}
          {canViewSensitive && user.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{user.phone}</p>
              </div>
            </div>
          )}

          {/* If viewer can't see sensitive info, show limited message */}
          {!canViewEmail && !canViewSensitive && (
            <p className="text-sm text-muted-foreground italic">
              Contact information is restricted to team administrators.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Professional Information */}
      {(user.bio || user.jobTitle) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <CardTitle>Professional Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.jobTitle && (
              <div>
                <p className="text-sm font-medium mb-1">Job Title</p>
                <p className="text-sm text-muted-foreground">{user.jobTitle}</p>
              </div>
            )}

            {user.bio && (
              <div>
                <p className="text-sm font-medium mb-1">Bio</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {user.bio}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Permissions & Role - Only visible to admins/owners or own profile */}
      {canViewSensitive && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Permissions & Role</CardTitle>
            </div>
            <CardDescription>
              {isOwnProfile
                ? "Your access level and permissions"
                : "User access level and permissions"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Current Role</p>
              <UserRoleBadge role={user.role} className="text-base px-3 py-1" />
            </div>

            {user.role && (
              <div>
                <p className="text-sm font-medium mb-1">Role Description</p>
                <p className="text-sm text-muted-foreground">
                  {user.role === RBAC_ROLES.OWNER &&
                    "Full control over the company and all resources"}
                  {user.role === RBAC_ROLES.ADMIN &&
                    "Manage users, forms, and data"}
                  {user.role === RBAC_ROLES.EDITOR &&
                    "Create and edit data and forms"}
                  {user.role === RBAC_ROLES.VIEWER &&
                    "Read-only access to data"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Account Information - Only visible to admins/owners or own profile */}
      {canViewSensitive && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Account Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {user.$createdAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Created</span>
                <span className="font-medium">
                  {format(new Date(user.$createdAt), "PPP")}
                </span>
              </div>
            )}

            {user.$updatedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">
                  {format(new Date(user.$updatedAt), "PPP")}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono text-xs">{user.userId}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
