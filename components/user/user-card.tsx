import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserRoleBadge } from "./user-role-badge";
import { UserStatusBadge } from "./user-status-badge";
import { getProfileLink, getUserInitials } from "@/lib/utils/profile-utils";
import { UserData } from "@/lib/types/user-types";
import { ChevronRight } from "lucide-react";

interface UserCardProps {
  user: UserData;
  showActions?: boolean;
  className?: string;
}

/**
 * User card component with profile link
 * Use this in team lists, search results, etc.
 */
export function UserCard({ user, showActions = true, className }: UserCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{user.name}</h3>
                <UserStatusBadge suspended={user.suspended} />
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {user.jobTitle || "No job title"}
              </p>
              <div className="mt-1">
                <UserRoleBadge role={user.role} />
              </div>
            </div>
          </div>

          {showActions && (
            <Button variant="ghost" size="sm" asChild className="flex-shrink-0">
              <Link href={getProfileLink(user.userId)}>
                View Profile
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact user card for inline display
 */
export function UserCardCompact({ user }: { user: UserData }) {
  return (
    <Link
      href={getProfileLink(user.userId)}
      className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="text-xs">
          {getUserInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {user.jobTitle || user.email}
        </p>
      </div>
      <UserRoleBadge role={user.role} className="text-xs" />
    </Link>
  );
}
