"use client";

import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    XCircle,
    Ban,
    PlayCircle,
    Edit,
    Trash2,
    MoreVertical,
} from "lucide-react";
import { Company } from "@/lib/types/company-types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useTransition, lazy, Suspense } from "react";
import {
    approveCompanyAction,
    activateCompanyAction,
} from "@/lib/services/actions/company.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const RejectCompanyDialog = lazy(
    () => import("./reject-company-dialog")
);
const EditCompanyDialog = lazy(() => import("./edit-company-dialog"));
const DeleteCompanyDialog = lazy(
    () => import("./delete-company-dialog")
);
const SuspendCompanyDialog = lazy(
    () => import("./suspend-company-dialog").then(mod => ({ default: mod.SuspendCompanyDialog }))
);

interface CompanyActionsBarProps {
    company: Company;
}

export function CompanyActionsBar({ company }: CompanyActionsBarProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [rejectDialog, setRejectDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [suspendDialog, setSuspendDialog] = useState(false);

    async function handleApprove() {
        startTransition(async () => {
            const result = await approveCompanyAction({ companyId: company.$id });

            if (result?.data?.success) {
                toast.success(result.data.message);
                router.refresh();
            } else if (result?.serverError) {
                toast.error(result.serverError);
            }
        });
    }

    function handleSuspend() {
        setSuspendDialog(true);
    }

    async function handleActivate() {
        startTransition(async () => {
            const result = await activateCompanyAction({ companyId: company.$id });

            if (result?.data?.success) {
                toast.success(result.data.message);
                router.refresh();
            } else if (result?.serverError) {
                toast.error(result.serverError);
            }
        });
    }

    return (
        <>
            <div className="flex gap-2">
                {/* Primary Actions based on status */}
                {company.status === "pending" && (
                    <>
                        <Button onClick={handleApprove} disabled={isPending}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setRejectDialog(true)}
                            disabled={isPending}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                        </Button>
                    </>
                )}

                {company.status === "active" && (
                    <Button
                        variant="outline"
                        onClick={handleSuspend}
                        disabled={isPending}
                    >
                        <Ban className="h-4 w-4 mr-2" />
                        Suspend
                    </Button>
                )}

                {company.status === "suspended" && (
                    <Button onClick={handleActivate} disabled={isPending}>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Activate
                    </Button>
                )}

                {/* More Actions Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setEditDialog(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Company
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteDialog(true)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Company
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Lazy-loaded Dialogs */}
            {rejectDialog && (
                <Suspense fallback={null}>
                    <RejectCompanyDialog
                        company={company}
                    />
                </Suspense>
            )}

            {editDialog && (
                <Suspense fallback={null}>
                    <EditCompanyDialog
                        company={company}
                    />
                </Suspense>
            )}

            {deleteDialog && (
                <Suspense fallback={null}>
                    <DeleteCompanyDialog
                        company={company}
                    />
                </Suspense>
            )}

            {suspendDialog && (
                <Suspense fallback={null}>
                    <SuspendCompanyDialog
                        company={company}
                        open={suspendDialog}
                        onOpenChange={setSuspendDialog}
                    />
                </Suspense>
            )}
        </>
    );
}