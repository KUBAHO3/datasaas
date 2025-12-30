"use client";

import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import {
    Download,
    Upload,
    Filter as FilterIcon,
    RefreshCw,
    Table as TableIcon,
    LayoutGrid,
    Search,
    Trash2
} from "lucide-react";
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
import { ImportDialog } from "./import-dialog";
import { SubmissionsTable } from "./submissions-table";
import { SubmissionsFilter } from "./submissions-filter";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubmissionsCardView } from "./submissions-card-view";

interface DataCollectionClientProps {
    forms: Form[];
    selectedForm: Form;
    initialRows: SubmissionRow[];
    orgId: string;
}

type ViewMode = "table" | "cards";

export function DataCollectionClient({
    forms,
    selectedForm,
    initialRows,
    orgId,
}: DataCollectionClientProps) {
    const router = useRouter();
    const [rows, setRows] = useState(initialRows);
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [showFilters, setShowFilters] = useState(false);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [viewDialogRow, setViewDialogRow] = useState<SubmissionRow | null>(null);
    const [editDialogRow, setEditDialogRow] = useState<SubmissionRow | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const { execute: deleteSubmission, isExecuting: isDeleting } = useAction(
        deleteSubmissionAction,
        {
            onSuccess: ({ data }) => {
                if (data?.success) {
                    toast.success("Submission deleted successfully");
                    router.refresh();
                }
            },
            onError: ({ error }) => {
                toast.error(error.serverError || "Failed to delete submission");
            },
        }
    );

    const { execute: bulkDelete, isExecuting: isBulkDeleting } = useAction(
        bulkDeleteSubmissionsAction,
        {
            onSuccess: ({ data }) => {
                if (data?.success) {
                    toast.success(data.message || "Submissions deleted successfully");
                    setSelectedIds([]);
                    router.refresh();
                }
            },
            onError: ({ error }) => {
                toast.error(error.serverError || "Failed to delete submissions");
            },
        }
    );

    const { execute: querySubmissions } = useAction(querySubmissionsAction, {
        onSuccess: ({ data }) => {
            if (data?.success) {
                setRows(data.rows);
            }
        },
        onError: ({ error }) => {
            toast.error(error.serverError || "Failed to filter submissions");
        },
    });

    const filteredRows = useMemo(() => {
        if (!searchQuery.trim()) return rows;

        const query = searchQuery.toLowerCase();
        return rows.filter((row) => {
            const submittedBy = row.submission.submittedByEmail?.toLowerCase() || "";
            const submissionId = row.submission.$id.toLowerCase();

            const fieldValuesMatch = Object.values(row.fieldValues).some((value) => {
                if (typeof value === "string") {
                    return value.toLowerCase().includes(query);
                }
                if (typeof value === "number") {
                    return value.toString().includes(query);
                }
                if (Array.isArray(value)) {
                    return value.some((v) =>
                        v.toString().toLowerCase().includes(query)
                    );
                }
                return false;
            });

            return (
                submittedBy.includes(query) ||
                submissionId.includes(query) ||
                fieldValuesMatch
            );
        });
    }, [rows, searchQuery]);

    function handleFilterChange(filterGroups: FilterGroup[]) {
        querySubmissions({
            formId: selectedForm.$id,
            filters: filterGroups,
        });
    }

    function handleClearFilters() {
        setRows(initialRows);
        setShowFilters(false);
        setSearchQuery("");
    }

    function handleFormChange(formId: string) {
        router.push(`/org/${orgId}/data-collection?formId=${formId}`);
    }

    function handleBulkDelete() {
        if (selectedIds.length === 0) return;

        const confirmed = confirm(
            `Delete ${selectedIds.length} submission(s)? This action cannot be undone.`
        );

        if (confirmed) {
            bulkDelete({ submissionIds: selectedIds });
        }
    }

    const completedCount = rows.filter(r => r.submission.status === "completed").length;
    const draftCount = rows.filter(r => r.submission.status === "draft").length;

    return (
        <div className="space-y-6">
            {/* Header Card with Form Selection & Actions */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {/* Top Row: Form Selection & Stats */}
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

                                <div className="flex gap-2">
                                    <Badge variant="secondary">
                                        {completedCount} Completed
                                    </Badge>
                                    <Badge variant="outline">
                                        {draftCount} Draft
                                    </Badge>
                                </div>
                            </div>

                            {/* View Mode Toggle */}
                            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                                <TabsList>
                                    <TabsTrigger value="table" className="gap-2">
                                        <TableIcon className="h-4 w-4" />
                                        Table
                                    </TabsTrigger>
                                    <TabsTrigger value="cards" className="gap-2">
                                        <LayoutGrid className="h-4 w-4" />
                                        Cards
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* Bottom Row: Search, Filter, Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px] max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search submissions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 ml-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <FilterIcon className="h-4 w-4 mr-2" />
                                    {showFilters ? "Hide" : "Show"} Filters
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.refresh()}
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh
                                </Button>

                                {selectedIds.length > 0 && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleBulkDelete}
                                        disabled={isBulkDeleting}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete ({selectedIds.length})
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowImportDialog(true)}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import
                                </Button>

                                <Button
                                    size="sm"
                                    onClick={() => setShowExportDialog(true)}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Advanced Filters Panel */}
            {showFilters && (
                <SubmissionsFilter
                    formFields={selectedForm.fields}
                    onFilterChange={handleFilterChange}
                    onClear={handleClearFilters}
                />
            )}

            {/* Empty State */}
            {filteredRows.length === 0 && (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <p className="text-lg font-medium text-muted-foreground">
                                {searchQuery || showFilters
                                    ? "No submissions match your filters"
                                    : "No submissions yet"
                                }
                            </p>
                            {(searchQuery || showFilters) && (
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={handleClearFilters}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Data Display - Table or Cards */}
            {filteredRows.length > 0 && (
                <>
                    {viewMode === "table" ? (
                        <SubmissionsTable
                            form={selectedForm}
                            rows={filteredRows}
                            selectedIds={selectedIds}
                            onSelectionChange={setSelectedIds}
                            onView={(row) => setViewDialogRow(row)}
                            onEdit={(row) => setEditDialogRow(row)}
                            onDelete={(id) => deleteSubmission({ submissionId: id })}
                            onBulkDelete={handleBulkDelete}
                            onExport={() => setShowExportDialog(true)}
                        />
                    ) : (
                        <SubmissionsCardView
                            form={selectedForm}
                            rows={filteredRows}
                            selectedIds={selectedIds}
                            onSelectionChange={setSelectedIds}
                            onView={(row: any) => setViewDialogRow(row)}
                            onEdit={(row: any) => setEditDialogRow(row)}
                            onDelete={(id: any) => deleteSubmission({ submissionId: id })}
                        />
                    )}
                </>
            )}

            <ExportDialog
                open={showExportDialog}
                onOpenChange={setShowExportDialog}
                formId={selectedForm.$id}
                formFields={selectedForm.fields}
                selectedIds={selectedIds}
            />

            <ImportDialog
                open={showImportDialog}
                onOpenChange={setShowImportDialog}
                formId={selectedForm.$id}
                formName={selectedForm.name}
                onImportComplete={() => {
                    router.refresh();
                    setShowImportDialog(false);
                }}
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