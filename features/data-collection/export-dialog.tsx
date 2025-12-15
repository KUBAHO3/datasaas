"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/lib/types/form-types";
import { Download, Loader2, FileText, Table2, FileJson } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { exportSubmissionsAction } from "@/lib/services/actions/submission-advanced.actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formId: string;
    formFields: FormField[];
    selectedIds?: string[];
}

type ExportFormat = "csv" | "excel" | "json" | "pdf";

export function ExportDialog({
    open,
    onOpenChange,
    formId,
    formFields,
    selectedIds = [],
}: ExportDialogProps) {
    const [format, setFormat] = useState<ExportFormat>("csv");
    const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>(
        formFields.map((f) => f.id)
    );
    const [includeMetadata, setIncludeMetadata] = useState(true);

    const { execute: exportData, isExecuting } = useAction(
        exportSubmissionsAction,
        {
            onSuccess: ({ data }) => {
                if (data?.success && data.dtadownloadUrl) {
                    // Create download link
                    const link = document.createElement("a");
                    link.href = data.downloadUrl;
                    link.download = data.filename || `export.${format}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    toast.success("Export completed successfully");
                    onOpenChange(false);
                }
            },
            onError: ({ error }) => {
                toast.error(error.serverError || "Failed to export data");
            },
        }
    );

    function handleExport() {
        exportData({
            formId,
            format,
            fieldIds: selectedFieldIds,
            includeMetadata,
            submissionIds: selectedIds.length > 0 ? selectedIds : undefined,
        });
    }

    function handleToggleField(fieldId: string) {
        setSelectedFieldIds((prev) =>
            prev.includes(fieldId)
                ? prev.filter((id) => id !== fieldId)
                : [...prev, fieldId]
        );
    }

    function handleSelectAllFields() {
        if (selectedFieldIds.length === formFields.length) {
            setSelectedFieldIds([]);
        } else {
            setSelectedFieldIds(formFields.map((f) => f.id));
        }
    }

    const allFieldsSelected = selectedFieldIds.length === formFields.length;
    const hasSelectedSubmissions = selectedIds.length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Export Submissions</DialogTitle>
                    <DialogDescription>
                        {hasSelectedSubmissions ? (
                            <span className="flex items-center gap-2">
                                Exporting {selectedIds.length} selected submission(s)
                                <Badge variant="secondary">{selectedIds.length}</Badge>
                            </span>
                        ) : (
                            "Export all submissions with customizable options"
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Export Format */}
                    <div className="space-y-3">
                        <Label>Export Format</Label>
                        <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
                            <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer">
                                <RadioGroupItem value="csv" id="csv" />
                                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer flex-1">
                                    <Table2 className="h-4 w-4" />
                                    <div>
                                        <div className="font-medium">CSV</div>
                                        <div className="text-xs text-muted-foreground">
                                            Comma-separated values, compatible with Excel
                                        </div>
                                    </div>
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer">
                                <RadioGroupItem value="excel" id="excel" />
                                <Label htmlFor="excel" className="flex items-center gap-2 cursor-pointer flex-1">
                                    <FileText className="h-4 w-4" />
                                    <div>
                                        <div className="font-medium">Excel (.xlsx)</div>
                                        <div className="text-xs text-muted-foreground">
                                            Microsoft Excel format with formatting
                                        </div>
                                    </div>
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer">
                                <RadioGroupItem value="json" id="json" />
                                <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer flex-1">
                                    <FileJson className="h-4 w-4" />
                                    <div>
                                        <div className="font-medium">JSON</div>
                                        <div className="text-xs text-muted-foreground">
                                            JavaScript Object Notation, for developers
                                        </div>
                                    </div>
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer">
                                <RadioGroupItem value="pdf" id="pdf" />
                                <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer flex-1">
                                    <FileText className="h-4 w-4" />
                                    <div>
                                        <div className="font-medium">PDF</div>
                                        <div className="text-xs text-muted-foreground">
                                            Printable document format
                                        </div>
                                    </div>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Field Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Fields to Include</Label>
                            <Button
                                variant="link"
                                size="sm"
                                onClick={handleSelectAllFields}
                                className="h-auto p-0"
                            >
                                {allFieldsSelected ? "Deselect All" : "Select All"}
                            </Button>
                        </div>

                        <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-lg p-3">
                            {formFields.map((field) => (
                                <div
                                    key={field.id}
                                    className="flex items-center space-x-2"
                                >
                                    <Checkbox
                                        id={`field-${field.id}`}
                                        checked={selectedFieldIds.includes(field.id)}
                                        onCheckedChange={() => handleToggleField(field.id)}
                                    />
                                    <Label
                                        htmlFor={`field-${field.id}`}
                                        className="text-sm font-normal cursor-pointer flex-1"
                                    >
                                        {field.label}
                                        <span className="text-xs text-muted-foreground ml-2">
                                            ({field.type})
                                        </span>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Additional Options */}
                    <div className="space-y-3">
                        <Label>Additional Options</Label>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="metadata"
                                checked={includeMetadata}
                                onCheckedChange={(checked) =>
                                    setIncludeMetadata(checked === true)
                                }
                            />
                            <Label
                                htmlFor="metadata"
                                className="text-sm font-normal cursor-pointer"
                            >
                                Include submission metadata (ID, timestamp, submitted by, status)
                            </Label>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="rounded-lg bg-muted p-3 text-sm">
                        <div className="font-medium mb-2">Export Summary:</div>
                        <div className="space-y-1 text-muted-foreground">
                            <div>Format: <span className="font-medium text-foreground">{format.toUpperCase()}</span></div>
                            <div>Fields: <span className="font-medium text-foreground">{selectedFieldIds.length} / {formFields.length}</span></div>
                            <div>Submissions: <span className="font-medium text-foreground">
                                {hasSelectedSubmissions ? `${selectedIds.length} selected` : "All"}
                            </span></div>
                            <div>Metadata: <span className="font-medium text-foreground">{includeMetadata ? "Yes" : "No"}</span></div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isExecuting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleExport}
                        disabled={isExecuting || selectedFieldIds.length === 0}
                    >
                        {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}