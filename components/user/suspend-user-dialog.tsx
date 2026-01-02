"use client";

import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { suspendUserAction, unsuspendUserAction } from "@/app/(company)/dashboard/profile/[userId]/actions";
import { Loader2, Ban, CheckCircle2 } from "lucide-react";
import { RBAC_ROLES } from "@/lib/constants/rbac-roles";

interface SuspendUserDialogProps {
  userId: string;
  userName: string;
  isSuspended?: boolean;
  currentUserRole?: string;
  children?: React.ReactNode;
}

export function SuspendUserDialog({
  userId,
  userName,
  isSuspended,
  currentUserRole,
  children,
}: SuspendUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");

  // Don't allow suspending if not admin/owner
  const canSuspend = currentUserRole === RBAC_ROLES.OWNER || currentUserRole === RBAC_ROLES.ADMIN;

  if (!canSuspend) {
    return null;
  }

  const handleAction = async () => {
    startTransition(async () => {
      const result = isSuspended
        ? await unsuspendUserAction({ userId })
        : await suspendUserAction({ userId, reason });

      if (result?.data?.error) {
        toast.error(result.data.error);
      } else if (result?.data?.success) {
        toast.success(result.data.message || `User ${isSuspended ? "unsuspended" : "suspended"} successfully`);
        setOpen(false);
        setReason("");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button
            variant={isSuspended ? "outline" : "destructive"}
            size="sm"
          >
            {isSuspended ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Unsuspend User
              </>
            ) : (
              <>
                <Ban className="h-4 w-4 mr-2" />
                Suspend User
              </>
            )}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isSuspended ? "Unsuspend User" : "Suspend User"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isSuspended ? (
              <>
                Are you sure you want to unsuspend <strong>{userName}</strong>?
                They will regain access to their account and all associated permissions.
              </>
            ) : (
              <>
                Are you sure you want to suspend <strong>{userName}</strong>?
                They will lose access to their account until unsuspended.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!isSuspended && (
          <div className="grid gap-2 py-4">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a reason for suspension..."
              rows={3}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleAction();
            }}
            disabled={isPending}
            className={isSuspended ? "" : "bg-destructive hover:bg-destructive/90"}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isSuspended ? (
              "Unsuspend"
            ) : (
              "Suspend"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
