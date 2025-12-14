"use client";

import { useState } from "react";
import { Form } from "@/lib/types/form-types";
import { SubmissionRow, FilterGroup } from "@/lib/types/submission-types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Download, Filter as FilterIcon, RefreshCw } from "lucide-react";
import { SubmissionViewDialog } from "./submission-view-dialog";
import { SubmissionEditDialog } from "./submission-edit-dialog";
import { useAction } from "next-safe-action/hooks";
import {
    querySubmissionsAction,
    bulkDeleteSubmissionsAction,
} from "@/lib/services/actions/submission-advanced.actions";
import { deleteSubmissionAction } from "@/lib/services/actions/form-submission.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ExportDialog } from "./export-dialog";
import { SubmissionsTable } from "./submissions-table";
import { SubmissionsFilter } from "./submissions-filter";

interface DataCollectionClientProps {
    forms: Form[];
    selectedForm: Form;
    initialRows: SubmissionRow[];
    orgId: string;
}

export function DataCollectionClient({
    forms,
    selectedForm,
    initialRows,
    orgId,
}: DataCollectionClientProps) {
    const router = useRouter();
    const [rows, setRows] = useState(initialRows);
    const [showFilters, setShowFilters] = useState(false);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [viewDialogRow, setViewDialogRow] = useState<SubmissionRow | null>(null);
    const [editDialogRow, setEditDialogRow] = useState<SubmissionRow | null>(null);
    const [currentFilters, setCurrentFilters] = useState<FilterGroup[]>([]);

    const { execute: querySubmissions, isExecuting: isQuerying } = useAction(
        querySubmissionsAction,
        {
            onSuccess: ({ data }) => {
                if (data?.success && data.rows) {
                    setRows(data.rows);
                    toast.success(`Found ${data.total} submission(s)`);
                }
            },
            onError: ({ error }) => {
                toast.error(error.serverError || "Failed to filter submissions");
            },
        }
    );

    const { execute: deleteSubmission } = useAction(deleteSubmissionAction, {
        onSuccess: () => {
            toast.success("Submission deleted successfully");
            router.refresh();
        },
        onError: ({ error }) => {
            toast.error(error.serverError || "Failed to delete submission");
        },
    });

    const { execute: bulkDelete } = useAction(bulkDeleteSubmissionsAction, {
        onSuccess: ({ data }) => {
            if (data?.success) {
                toast.success(data.message);
                router.refresh();
            }
        },
        onError: ({ error }) => {
            toast.error(error.serverError || "Failed to delete submissions");
        },
    });

    function handleFilterChange(filters: FilterGroup[]) {
        setCurrentFilters(filters);
        querySubmissions({
            formId: selectedForm.$id,
            filters,
            limit: 100,
        });
    }

    function handleClearFilters() {
        setCurrentFilters([]);
        setRows(initialRows);
        setShowFilters(false);
    }

    function handleFormChange(formId: string) {
        router.push(`/org/${orgId}/data-collection?formId=${formId}`);
    }

    return (
        <div className="space-y-6">
            {/* Form Selection & Actions */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                            <Select
                                value={selectedForm.$id}
                                onValueChange={handleFormChange}
                            >
                                <SelectTrigger className="w-full max-w-md">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {forms.map((form) => (
                                        <SelectItem key={form.$id} value={form.$id}>
                                            {form.name} ({form.metadata.responseCount || 0} submissions)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <FilterIcon className="h-4 w-4 mr-2" />
                                {showFilters ? "Hide" : "Show"} Filters
                            </Button>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => router.refresh()}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                            <Button onClick={() => setShowExportDialog(true)}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {showFilters && (
                <SubmissionsFilter
                    formFields={selectedForm.fields}
                    onFilterChange={handleFilterChange}
                    onClear={handleClearFilters}
                />
            )}

            <SubmissionsTable
                form={selectedForm}
                rows={rows}
                onView={(row) => setViewDialogRow(row)}
                onEdit={(row) => setEditDialogRow(row)}
                onDelete={(id) => deleteSubmission({ submissionId: id })}
                onBulkDelete={(ids) => bulkDelete({ submissionIds: ids })}
                onExport={() => setShowExportDialog(true)}
            />

            <ExportDialog
                open={showExportDialog}
                onOpenChange={setShowExportDialog}
                formId={selectedForm.$id}
                formFields={selectedForm.fields}
            />

            {viewDialogRow && (
                <SubmissionViewDialog
                    open={!!viewDialogRow}
                    onOpenChange={(open) => !open && setViewDialogRow(null)}
                    row={viewDialogRow}
                    form={selectedForm}
                />
            )}

            {editDialogRow && (
                <SubmissionEditDialog
                    open={!!editDialogRow}
                    onOpenChange={(open) => !open && setEditDialogRow(null)}
                    row={editDialogRow}
                    form={selectedForm}
                />
            )}
        </div>
    );
}