"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    XCircle,
    Ban,
    PlayCircle,
    MoreVertical,
    Building2
} from "lucide-react";
import { useState, useTransition } from "react";
import {
    approveCompanyAction,
    rejectCompanyAction,
    suspendCompanyAction,
    activateCompanyAction
} from "@/lib/services/actions/company.actions";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Company } from "@/lib/types/company-types";

interface CompaniesTableProps {
    companies: Company[];
    highlightId?: string;
}

export function CompaniesTable({ companies, highlightId }: CompaniesTableProps) {
    const [isPending, startTransition] = useTransition();
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    async function handleApprove(companyId: string) {
        startTransition(async () => {
            const result = await approveCompanyAction({ companyId });

            if (result?.data?.success) {
                toast.success(result.data.message);
            } else if (result?.serverError) {
                toast.error(result.serverError);
            }
        });
    }

    async function handleReject() {
        if (!selectedCompany || !rejectionReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }

        startTransition(async () => {
            const result = await rejectCompanyAction({
                companyId: selectedCompany.$id,
                reason: rejectionReason
            });

            if (result?.data?.success) {
                toast.success(result.data.message);
                setShowRejectDialog(false);
                setSelectedCompany(null);
                setRejectionReason("");
            } else if (result?.serverError) {
                toast.error(result.serverError);
            }
        });
    }

    async function handleSuspend(companyId: string) {
        startTransition(async () => {
            const result = await suspendCompanyAction({ companyId });

            if (result?.data?.success) {
                toast.success(result.data.message);
            } else if (result?.serverError) {
                toast.error(result.serverError);
            }
        });
    }

    async function handleActivate(companyId: string) {
        startTransition(async () => {
            const result = await activateCompanyAction({ companyId });

            if (result?.data?.success) {
                toast.success(result.data.message);
            } else if (result?.serverError) {
                toast.error(result.serverError);
            }
        });
    }

    function openRejectDialog(company: Company) {
        setSelectedCompany(company);
        setShowRejectDialog(true);
    }

    const getStatusBadge = (status: Company['status']) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
            active: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
            suspended: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
            rejected: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
        };

        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (companies.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No companies found</p>
                    <p className="text-sm text-muted-foreground">
                        Try adjusting your filters or check back later
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Company
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Industry
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Applied
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {companies.map((company) => (
                                    <tr
                                        key={company.$id}
                                        className={`hover:bg-muted/50 transition-colors ${highlightId === company.$id ? 'bg-primary/5' : ''
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{company.name}</span>
                                                {company.website && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {company.website}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-sm">
                                                <span>{company.email}</span>
                                                {company.phone && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {company.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {company.industry || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(company.status)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {format(new Date(company.$createdAt), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {company.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleApprove(company.$id)}
                                                            disabled={isPending}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openRejectDialog(company)}
                                                            disabled={isPending}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}

                                                {company.status === 'active' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleSuspend(company.$id)}
                                                        disabled={isPending}
                                                    >
                                                        <Ban className="h-4 w-4 mr-1" />
                                                        Suspend
                                                    </Button>
                                                )}

                                                {company.status === 'suspended' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleActivate(company.$id)}
                                                        disabled={isPending}
                                                    >
                                                        <PlayCircle className="h-4 w-4 mr-1" />
                                                        Activate
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Company Application</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting {selectedCompany?.name}&apos;s application.
                            This will be recorded in the system.
                        </DialogDescription>
                    </DialogHeader>

                    <Field>
                        <FieldLabel>Rejection Reason</FieldLabel>
                        <Textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter the reason for rejection..."
                            rows={4}
                        />
                    </Field>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRejectDialog(false);
                                setSelectedCompany(null);
                                setRejectionReason("");
                            }}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isPending || !rejectionReason.trim()}
                        >
                            {isPending ? "Rejecting..." : "Reject Application"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}