import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface UserStatusBadgeProps {
  suspended?: boolean;
  className?: string;
}

export function UserStatusBadge({ suspended, className }: UserStatusBadgeProps) {
  if (suspended) {
    return (
      <Badge variant="destructive" className={`${className} flex items-center gap-1`}>
        <AlertCircle className="h-3 w-3" />
        Suspended
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={`${className} flex items-center gap-1 border-green-600 text-green-600`}>
      <CheckCircle2 className="h-3 w-3" />
      Active
    </Badge>
  );
}
