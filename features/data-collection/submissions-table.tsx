"use client";

import { useState } from "react";
import { Form } from "@/lib/types/form-types";
import { SubmissionRow } from "@/lib/types/submission-types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Download,
    CheckCircle,
    Clock,
} from "lucide-react";
import { SubmissionHelpers } from "@/lib/utils/submission-utils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SubmissionsTableProps {
    form: Form;
    rows: SubmissionRow[];
    onView: (row: SubmissionRow) => void;
    onEdit: (row: SubmissionRow) => void;
    onDelete: (submissionId: string) => void;
    onBulkDelete: (submissionIds: string[]) => void;
    onExport: (submissionIds?: string[]) => void;
}

export function SubmissionsTable({
    form,
    rows,
    onView,
    onEdit,
    onDelete,
    onBulkDelete,
    onExport,
}: SubmissionsTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Get visible fields (limit to first 5 for table display)
    const visibleFields = form.fields.slice(0, 5);

    function handleSelectAll(checked: boolean) {
        if (checked) {
            setSelectedIds(rows.map((r) => r.submission.$id));
        } else {
            setSelectedIds([]);
        }
    }

    function handleSelectOne(id: string, checked: boolean) {
        if (checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter((sid) => sid !== id));
        }
    }

    const allSelected = selectedIds.length === rows.length && rows.length > 0;
    const someSelected = selectedIds.length > 0 && !allSelected;

    return (
        <div className="space-y-4">
            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="flex items-center justify-between bg-muted/50 px-4 py-2 rounded-lg border">
                    <span className="text-sm font-medium">
                        {selectedIds.length} selected
                    </span>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onExport(selectedIds)}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export Selected
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                                if (
                                    confirm(
                                        `Delete ${selectedIds.length} submission(s)? This cannot be undone.`
                                    )
                                ) {
                                    onBulkDelete(selectedIds);
                                    setSelectedIds([]);
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Selected
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedIds([])}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Select all"
                                        className={cn(someSelected && "opacity-50")}
                                    />
                                </TableHead>
                                <TableHead className="w-24">Status</TableHead>
                                <TableHead className="min-w-[150px]">Submitted</TableHead>
                                <TableHead className="min-w-[150px]">Submitted By</TableHead>
                                {visibleFields.map((field) => (
                                    <TableHead key={field.id} className="min-w-[150px]">
                                        {field.label}
                                    </TableHead>
                                ))}
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5 + visibleFields.length}
                                        className="text-center py-8 text-muted-foreground"
                                    >
                                        No submissions found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row) => (
                                    <TableRow key={row.submission.$id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(row.submission.$id)}
                                                onCheckedChange={(checked) =>
                                                    handleSelectOne(row.submission.$id, checked as boolean)
                                                }
                                                aria-label={`Select submission ${row.submission.$id}`}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {row.submission.status === "completed" ? (
                                                <Badge variant="default" className="gap-1">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Completed
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Draft
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {row.submission.submittedAt
                                                ? format(new Date(row.submission.submittedAt), "PPp")
                                                : "—"}
                                        </TableCell>
                                        <TableCell>
                                            {row.submission.submittedByEmail ||
                                                row.submission.submittedBy ||
                                                "Anonymous"}
                                        </TableCell>
                                        {visibleFields.map((field) => (
                                            <TableCell key={field.id}>
                                                {SubmissionHelpers.formatFieldValue(
                                                    row.fieldValues[field.id],
                                                    field.type
                                                )}
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => onView(row)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onEdit(row)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    "Delete this submission? This cannot be undone."
                                                                )
                                                            ) {
                                                                onDelete(row.submission.$id);
                                                            }
                                                        }}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}