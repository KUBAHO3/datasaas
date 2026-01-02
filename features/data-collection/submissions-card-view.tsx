"use client";

import { useState } from "react";
import { Form } from "@/lib/types/form-types";
import { SubmissionRow } from "@/lib/types/submission-types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    Clock,
    Calendar,
    User,
    Mail,
} from "lucide-react";
import { SubmissionHelpers } from "@/lib/utils/submission-utils";
import { format } from "date-fns";

interface SubmissionsCardViewProps {
    form: Form;
    rows: SubmissionRow[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    onView: (row: SubmissionRow) => void;
    onEdit: (row: SubmissionRow) => void;
    onDelete: (submissionId: string) => void;
}

export function SubmissionsCardView({
    form,
    rows,
    selectedIds,
    onSelectionChange,
    onView,
    onEdit,
    onDelete,
}: SubmissionsCardViewProps) {
    // Delete confirmation dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null);

    // Handle delete confirmation
    const handleDeleteClick = (submissionId: string) => {
        setSubmissionToDelete(submissionId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (submissionToDelete) {
            onDelete(submissionToDelete);
            setSubmissionToDelete(null);
        }
        setDeleteDialogOpen(false);
    };

    function handleSelectCard(id: string, checked: boolean) {
        if (checked) {
            onSelectionChange([...selectedIds, id]);
        } else {
            onSelectionChange(selectedIds.filter((sid) => sid !== id));
        }
    }

    // Get first 4 visible fields for card preview
    const previewFields = form.fields
        .filter(f =>
            f.type !== "section_header" &&
            f.type !== "divider" &&
            f.type !== "rich_text"
        )
        .slice(0, 4);

    return (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((row) => {
                const isSelected = selectedIds.includes(row.submission.$id);
                const isCompleted = row.submission.status === "completed";

                return (
                    <Card
                        key={row.submission.$id}
                        className={`relative transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary" : ""
                            }`}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-3 flex-1">
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) =>
                                            handleSelectCard(row.submission.$id, checked === true)
                                        }
                                        className="mt-1"
                                    />
                                    <div className="flex-1 min-w-0">
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
                                        <p className="text-xs text-muted-foreground mt-1 truncate">
                                            ID: {row.submission.$id.slice(0, 12)}...
                                        </p>
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
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
                                            onClick={() => handleDeleteClick(row.submission.$id)}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-3 pb-3">
                            {/* Submission Info */}
                            <div className="space-y-2 text-sm border-b pb-3">
                                {row.submission.submittedAt && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span className="text-xs">
                                            {format(new Date(row.submission.submittedAt), "PPp")}
                                        </span>
                                    </div>
                                )}
                                {row.submission.submittedByEmail && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-3.5 w-3.5" />
                                        <span className="text-xs truncate">
                                            {row.submission.submittedByEmail}
                                        </span>
                                    </div>
                                )}
                                {!row.submission.submittedByEmail && row.submission.submittedBy && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <User className="h-3.5 w-3.5" />
                                        <span className="text-xs">
                                            User ID: {row.submission.submittedBy.slice(0, 12)}...
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Field Previews */}
                            <div className="space-y-2">
                                {previewFields.map((field) => {
                                    const value = row.fieldValues[field.id];
                                    const formattedValue = SubmissionHelpers.formatFieldValue(
                                        value,
                                        field.type
                                    );

                                    return (
                                        <div key={field.id} className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                {field.label}
                                            </p>
                                            <p className="text-sm truncate">
                                                {formattedValue || <span className="text-muted-foreground">—</span>}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>

                        <CardFooter className="pt-3 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => onView(row)}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                View Full Details
                            </Button>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Submission</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this submission? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeleteConfirm}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
    );
}