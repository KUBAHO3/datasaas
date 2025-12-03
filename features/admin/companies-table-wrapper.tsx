"use client";

import { useState, useTransition, lazy, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    CheckCircle2,
    XCircle,
    Ban,
    PlayCircle,
    Eye,
    Edit,
    Trash2,
    Download,
    MoreVertical,
    Building2,
    Users,
} from "lucide-react";
import { Company } from "@/lib/types/company-types";
import { format } from "date-fns";
import { toast } from "sonner";
import {
    approveCompanyAction,
    rejectCompanyAction,
    suspendCompanyAction,
    activateCompanyAction,
    bulkApproveCompaniesAction,
    // exportCompaniesToCSV,
} from "@/lib/services/actions/company.actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

const RejectCompanyDialog = lazy(() => import("./reject-company-dialog"));
const EditCompanyDialog = lazy(() => import("./edit-company-dialog"));
const DeleteCompanyDialog = lazy(() => import("./delete-company-dialog"));
const ViewTeamMembersDialog = lazy(() => import("./view-team-members-dialog"));

interface CompaniesTableWrapperProps {
    initialCompanies: Company[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    filters: {
        status?: string;
        industry?: string;
        search?: string;
    };
    highlightId?: string;
}

export function CompaniesTableWrapper({
    initialCompanies,
    pagination,
    filters,
    highlightId,
}: CompaniesTableWrapperProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
    const [isExporting, setIsExporting] = useState(false);

    const [rejectDialog, setRejectDialog] = useState<{
        open: boolean;
        company: Company | null;
    }>({ open: false, company: null });
    const [editDialog, setEditDialog] = useState<{
        open: boolean;
        company: Company | null;
    }>({ open: false, company: null });
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        company: Company | null;
    }>({ open: false, company: null });
    const [teamDialog, setTeamDialog] = useState<{
        open: boolean;
        companyId: string | null;
    }>({ open: false, companyId: null });

    function handleSelectAll(checked: boolean) {
        if (checked) {
            setSelectedCompanies(initialCompanies.map((c) => c.$id));
        } else {
            setSelectedCompanies([]);
        }
    }

    function handleSelectCompany(companyId: string, checked: boolean) {
        if (checked) {
            setSelectedCompanies((prev) => [...prev, companyId]);
        } else {
            setSelectedCompanies((prev) => prev.filter((id) => id !== companyId));
        }
    }

    async function handleApprove(companyId: string) {
        startTransition(async () => {
            const result = await approveCompanyAction({ companyId });

            if (result?.data?.success) {
                toast.success(result.data.message);
                router.refresh();
            } else if (result?.serverError) {
                toast.error(result.serverError);
            }
        });
    }

    async function handleSuspend(companyId: string) {
        startTransition(async () => {
            const result = await suspendCompanyAction({ companyId, reason: '' });

            if (result?.data?.success) {
                toast.success(result.data.message);
                router.refresh();
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
                router.refresh();
            } else if (result?.serverError) {
                toast.error(result.serverError);
            }
        });
    }

    async function handleBulkApprove() {
        if (selectedCompanies.length === 0) {
            toast.error("Please select companies to approve");
            return;
        }

        startTransition(async () => {
            const result = await bulkApproveCompaniesAction({
                companyIds: selectedCompanies,
            });

            if (result?.data?.success) {
                toast.success(result.data.message);
                setSelectedCompanies([]);
                router.refresh();
            } else if (result?.serverError) {
                toast.error(result.serverError);
            }
        });
    }

    // async function handleExport() {
    //     setIsExporting(true);
    //     try {
    //         const result = await exportCompaniesToCSV(filters);

    //         const blob = new Blob([result.content], { type: "text/csv" });
    //         const url = window.URL.createObjectURL(blob);
    //         const a = document.createElement("a");
    //         a.href = url;
    //         a.download = result.filename;
    //         document.body.appendChild(a);
    //         a.click();
    //         document.body.removeChild(a);
    //         window.URL.revokeObjectURL(url);

    //         toast.success("Companies exported successfully");
    //     } catch (error) {
    //         toast.error("Failed to export companies");
    //     } finally {
    //         setIsExporting(false);
    //     }
    // }

    function buildPageUrl(page: number) {
        const params = new URLSearchParams();
        if (filters.status) params.set("status", filters.status);
        if (filters.industry) params.set("industry", filters.industry);
        if (filters.search) params.set("search", filters.search);
        params.set("page", page.toString());
        return `/admin/companies?${params.toString()}`;
    }

    const getStatusBadge = (status: Company["status"]) => {
        const styles = {
            pending:
                "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
            active:
                "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
            suspended: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
            rejected:
                "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
        };

        return (
            <Badge variant="outline" className={styles[status]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    if (initialCompanies.length === 0) {
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

    const allSelected = selectedCompanies.length === initialCompanies.length;
    const someSelected = selectedCompanies.length > 0 && !allSelected;

    return (
        <>
            <Card>
                <CardContent className="p-0">
                    {selectedCompanies.length > 0 && (
                        <div className="flex items-center justify-between border-b bg-muted/50 px-6 py-3">
                            <span className="text-sm font-medium">
                                {selectedCompanies.length} selected
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleBulkApprove}
                                    disabled={isPending}
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Bulk Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedCompanies([])}
                                    disabled={isPending}
                                >
                                    Clear Selection
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* <div className="flex items-center justify-end border-b px-6 py-3">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleExport}
                            disabled={isExporting}
                        >
                            <Download className="h-4 w-4 mr-1" />
                            {isExporting ? "Exporting..." : "Export CSV"}
                        </Button>
                    </div> */}

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-6 py-3 text-left">
                                        <Checkbox
                                            checked={allSelected}
                                            onCheckedChange={handleSelectAll}
                                            aria-label="Select all"
                                            className={someSelected ? "opacity-50" : ""}
                                        />
                                    </th>
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
                                {initialCompanies.map((company) => (
                                    <tr
                                        key={company.$id}
                                        className={`hover:bg-muted/50 transition-colors ${highlightId === company.$id ? "bg-primary/5" : ""
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <Checkbox
                                                checked={selectedCompanies.includes(company.$id)}
                                                onCheckedChange={(checked) =>
                                                    handleSelectCompany(company.$id, checked as boolean)
                                                }
                                                aria-label={`Select ${company.companyName}`}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <Link
                                                    href={`/admin/companies/${company.$id}`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {company.companyName}
                                                </Link>
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
                                            {company.industry || "N/A"}
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(company.status)}</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {format(new Date(company.$createdAt), "MMM d, yyyy")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {company.status === "pending" && (
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
                                                            onClick={() =>
                                                                setRejectDialog({ open: true, company })
                                                            }
                                                            disabled={isPending}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}

                                                {company.status === "active" && (
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

                                                {company.status === "suspended" && (
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

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="sm" variant="ghost">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/companies/${company.$id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setEditDialog({ open: true, company })
                                                            }
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit Company
                                                        </DropdownMenuItem>
                                                        {company.teamId && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    setTeamDialog({
                                                                        open: true,
                                                                        companyId: company.$id,
                                                                    })
                                                                }
                                                            >
                                                                <Users className="mr-2 h-4 w-4" />
                                                                View Team
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() =>
                                                                setDeleteDialog({ open: true, company })
                                                            }
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Company
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t px-6 py-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                                {Math.min(
                                    pagination.page * pagination.limit,
                                    pagination.total
                                )}{" "}
                                of {pagination.total} companies
                            </p>

                            <Pagination>
                                <PaginationContent>
                                    {pagination.page > 1 && (
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href={buildPageUrl(pagination.page - 1)}
                                            />
                                        </PaginationItem>
                                    )}

                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                        .filter((page) => {
                                            return (
                                                page === 1 ||
                                                page === pagination.totalPages ||
                                                Math.abs(page - pagination.page) <= 1
                                            );
                                        })
                                        .map((page, idx, arr) => {
                                            if (idx > 0 && page - arr[idx - 1] > 1) {
                                                return (
                                                    <PaginationItem key={`ellipsis-${page}`}>
                                                        <span className="px-4">...</span>
                                                    </PaginationItem>
                                                );
                                            }
                                            return (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        href={buildPageUrl(page)}
                                                        isActive={page === pagination.page}
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        })}

                                    {pagination.page < pagination.totalPages && (
                                        <PaginationItem>
                                            <PaginationNext href={buildPageUrl(pagination.page + 1)} />
                                        </PaginationItem>
                                    )}
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>

            {rejectDialog.open && (
                <Suspense fallback={null}>
                    <RejectCompanyDialog
                        company={rejectDialog.company!}
                    // open={rejectDialog.open}
                    // onOpenChange={(open) =>
                    //     setRejectDialog({ open, company: open ? rejectDialog.company : null })
                    // }
                    />
                </Suspense>
            )}

            {editDialog.open && (
                <Suspense fallback={null}>
                    <EditCompanyDialog
                        company={editDialog.company!}
                    // open={editDialog.open}
                    // onOpenChange={(open) =>
                    //     setEditDialog({ open, company: open ? editDialog.company : null })
                    // }
                    />
                </Suspense>
            )}

            {deleteDialog.open && (
                <Suspense fallback={null}>
                    <DeleteCompanyDialog
                        company={deleteDialog.company!}
                    // open={deleteDialog.open}
                    // onOpenChange={(open) =>
                    //     setDeleteDialog({ open, company: open ? deleteDialog.company : null })
                    // }
                    />
                </Suspense>
            )}

            {teamDialog.open && (
                <Suspense fallback={null}>
                    <ViewTeamMembersDialog
                        companyId={teamDialog.companyId!}
                        open={teamDialog.open}
                        onOpenChange={(open) =>
                            setTeamDialog({
                                open,
                                companyId: open ? teamDialog.companyId : null,
                            })
                        }
                    />
                </Suspense>
            )}
        </>
    );
}