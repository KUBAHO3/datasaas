import { Badge } from "@/components/ui/badge";
import { RBAC_ROLES, ROLE_DESCRIPTIONS, RBACRole } from "@/lib/constants/rbac-roles";
import { Shield, ShieldCheck, Edit, Eye } from "lucide-react";

interface UserRoleBadgeProps {
  role: string | undefined;
  className?: string;
}

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  if (!role) {
    return (
      <Badge variant="outline" className={className}>
        No Role
      </Badge>
    );
  }

  const roleConfig = {
    [RBAC_ROLES.OWNER]: {
      icon: ShieldCheck,
      variant: "default" as const,
      className: "bg-purple-600 hover:bg-purple-700 text-white",
    },
    [RBAC_ROLES.ADMIN]: {
      icon: Shield,
      variant: "default" as const,
      className: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    [RBAC_ROLES.EDITOR]: {
      icon: Edit,
      variant: "secondary" as const,
      className: "bg-green-600 hover:bg-green-700 text-white",
    },
    [RBAC_ROLES.VIEWER]: {
      icon: Eye,
      variant: "outline" as const,
      className: "",
    },
  };

  const config = roleConfig[role as RBACRole] || {
    icon: Eye,
    variant: "outline" as const,
    className: "",
  };

  const Icon = config.icon;
  const description = ROLE_DESCRIPTIONS[role as RBACRole];

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className} flex items-center gap-1`}
      title={description?.description}
    >
      <Icon className="h-3 w-3" />
      {description?.label || role}
    </Badge>
  );
}
