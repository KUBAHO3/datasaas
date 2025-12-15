"use client";

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
import { Card, CardContent } from "@/components/ui/card";
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
    CheckCircle,
    Clock,
} from "lucide-react";
import { SubmissionHelpers } from "@/lib/utils/submission-utils";
import { format } from "date-fns";

interface SubmissionsTableProps {
    form: Form;
    rows: SubmissionRow[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    onView: (row: SubmissionRow) => void;
    onEdit: (row: SubmissionRow) => void;
    onDelete: (submissionId: string) => void;
    onBulkDelete: () => void;
    onExport: (submissionIds?: string[]) => void;
}

export function SubmissionsTable({
    form,
    rows,
    selectedIds,
    onSelectionChange,
    onView,
    onEdit,
    onDelete,
    onBulkDelete,
    onExport,
}: SubmissionsTableProps) {
    const visibleFields = form.fields
        .filter(f =>
            f.type !== "section_header" &&
            f.type !== "divider" &&
            f.type !== "rich_text"
        )
        .slice(0, 5);

    function handleSelectAll(checked: boolean) {
        if (checked) {
            onSelectionChange(rows.map((r) => r.submission.$id));
        } else {
            onSelectionChange([]);
        }
    }

    function handleSelectOne(id: string, checked: boolean) {
        if (checked) {
            onSelectionChange([...selectedIds, id]);
        } else {
            onSelectionChange(selectedIds.filter((sid) => sid !== id));
        }
    }

    const allSelected = selectedIds.length === rows.length && rows.length > 0;
    const someSelected = selectedIds.length > 0 && !allSelected;

    return (
        <Card>
            <CardContent className="p-0">
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Select all"
                                        className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
                                    />
                                </TableHead>
                                <TableHead className="min-w-[120px]">Status</TableHead>
                                <TableHead className="min-w-[180px]">Submitted</TableHead>
                                <TableHead className="min-w-[200px]">Submitted By</TableHead>
                                {visibleFields.map((field) => (
                                    <TableHead key={field.id} className="min-w-[150px]">
                                        {field.label}
                                    </TableHead>
                                ))}
                                <TableHead className="w-12">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={visibleFields.length + 4}
                                        className="h-24 text-center"
                                    >
                                        No submissions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row) => {
                                    const isSelected = selectedIds.includes(row.submission.$id);
                                    const isCompleted = row.submission.status === "completed";

                                    return (
                                        <TableRow
                                            key={row.submission.$id}
                                            className={isSelected ? "bg-muted/50" : ""}
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectOne(row.submission.$id, checked === true)
                                                    }
                                                    aria-label={`Select submission ${row.submission.$id}`}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={isCompleted ? "default" : "secondary"}
                                                    className="gap-1"
                                                >
                                                    {isCompleted ? (
                                                        <>
                                                            <CheckCircle className="h-3 w-3" />
                                                            Completed
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="h-3 w-3" />
                                                            Draft
                                                        </>
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {row.submission.submittedAt
                                                    ? format(new Date(row.submission.submittedAt), "PPp")
                                                    : "—"}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {row.submission.submittedByEmail ||
                                                    row.submission.submittedBy ||
                                                    "Anonymous"}
                                            </TableCell>
                                            {visibleFields.map((field) => (
                                                <TableCell key={field.id} className="text-sm">
                                                    <div className="max-w-[200px] truncate">
                                                        {SubmissionHelpers.formatFieldValue(
                                                            row.fieldValues[field.id],
                                                            field.type
                                                        )}
                                                    </div>
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
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}