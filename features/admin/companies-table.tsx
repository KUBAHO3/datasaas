"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Eye, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Company } from "@/lib/types/company-types";
import { BulkOperations } from "./bulk-operations";
import EditCompanyDialog from "./edit-company-dialog";
import DeleteCompanyDialog from "./delete-company-dialog";

interface CompaniesTableProps {
    companies: Company[];
}

export function CompaniesTable({ companies }: CompaniesTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "suspended":
                return "bg-orange-100 text-orange-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            // Only select pending companies for bulk operations
            const pendingIds = companies
                .filter((c) => c.status === "pending")
                .map((c) => c.$id);
            setSelectedIds(pendingIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectCompany = (companyId: string, checked: boolean) => {
        if (checked) {
            setSelectedIds((prev) => [...prev, companyId]);
        } else {
            setSelectedIds((prev) => prev.filter((id) => id !== companyId));
        }
    };

    const clearSelection = () => {
        setSelectedIds([]);
    };

    const pendingCompanies = companies.filter((c) => c.status === "pending");
    const allPendingSelected =
        pendingCompanies.length > 0 &&
        pendingCompanies.every((c) => selectedIds.includes(c.$id));
    const somePendingSelected =
        selectedIds.length > 0 && !allPendingSelected;

    return (
        <div className="space-y-4">
            {selectedIds.length > 0 && (
                <BulkOperations
                    selectedCompanyIds={selectedIds}
                    onComplete={clearSelection}
                />
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={allPendingSelected}
                                    onCheckedChange={handleSelectAll}
                                    aria-label="Select all pending companies"
                                    className={somePendingSelected ? "data-[state=checked]:bg-primary" : ""}
                                />
                            </TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Industry</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {companies.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Building2 className="h-8 w-8" />
                                        <p>No companies found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            companies.map((company) => {
                                const isSelected = selectedIds.includes(company.$id);
                                const canSelect = company.status === "pending";

                                return (
                                    <TableRow
                                        key={company.$id}
                                        className={isSelected ? "bg-muted/50" : ""}
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={(checked) =>
                                                    handleSelectCompany(company.$id, checked as boolean)
                                                }
                                                disabled={!canSelect}
                                                aria-label={`Select ${company.companyName}`}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{company.companyName}</div>
                                            {company.email && (
                                                <div className="text-sm text-muted-foreground">
                                                    {company.email}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {company.industry || "—"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={getStatusColor(company.status)}
                                            >
                                                {company.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(company.$createdAt).toLocaleDateString()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/admin/companies/${company.$id}`}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View
                                                    </Link>
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">More actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem asChild>
                                                            <div className="cursor-pointer">
                                                                <EditCompanyDialog company={company} />
                                                            </div>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <div className="cursor-pointer">
                                                                <DeleteCompanyDialog company={company} />
                                                            </div>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}