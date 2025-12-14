"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ExportFormat } from "@/lib/types/submission-types";
import { FormField } from "@/lib/types/form-types";
import { Download, FileSpreadsheet, FileText, FileJson, FileImage } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { exportSubmissionsAction } from "@/lib/services/actions/submission-advanced.actions";
import { toast } from "sonner";

interface ExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formId: string;
    formFields: FormField[];
}

export function ExportDialog({
    open,
    onOpenChange,
    formId,
    formFields,
}: ExportDialogProps) {
    const [format, setFormat] = useState<ExportFormat>("excel");
    const [includeMetadata, setIncludeMetadata] = useState(false);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);

    const { execute: exportData, isExecuting } = useAction(exportSubmissionsAction, {
        onSuccess: ({ data }) => {
            if (data?.success) {
                const blob = b64toBlob(data.data, data.mimeType);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = data.filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                toast.success("Export completed successfully!");
                onOpenChange(false);
            }
        },
        onError: ({ error }) => {
            toast.error(error.serverError || "Export failed");
        },
    });

    function handleExport() {
        exportData({
            format,
            formId,
            includeMetadata,
            selectedFields: selectedFields.length > 0 ? selectedFields : undefined,
        });
    }

    function toggleField(fieldId: string) {
        if (selectedFields.includes(fieldId)) {
            setSelectedFields(selectedFields.filter((id) => id !== fieldId));
        } else {
            setSelectedFields([...selectedFields, fieldId]);
        }
    }

    function selectAllFields() {
        setSelectedFields(formFields.map((f) => f.id));
    }

    function clearAllFields() {
        setSelectedFields([]);
    }

    const formatIcons = {
        excel: FileSpreadsheet,
        csv: FileText,
        json: FileJson,
        pdf: FileImage,
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Export Submissions</DialogTitle>
                    <DialogDescription>
                        Choose export format and select fields to include
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Format Selection */}
                    <div className="space-y-3">
                        <Label>Export Format</Label>
                        <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
                            {(["excel", "csv", "json", "pdf"] as ExportFormat[]).map((fmt) => {
                                const Icon = formatIcons[fmt];
                                return (
                                    <div key={fmt} className="flex items-center space-x-2">
                                        <RadioGroupItem value={fmt} id={fmt} />
                                        <Label htmlFor={fmt} className="flex items-center gap-2 cursor-pointer">
                                            <Icon className="h-4 w-4" />
                                            {fmt.toUpperCase()}
                                            {fmt === "excel" && (
                                                <span className="text-xs text-muted-foreground">
                                                    (Recommended)
                                                </span>
                                            )}
                                        </Label>
                                    </div>
                                );
                            })}
                        </RadioGroup>
                    </div>

                    {/* Field Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Select Fields</Label>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={selectAllFields}
                                    type="button"
                                >
                                    Select All
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAllFields}
                                    type="button"
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                        <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                            {formFields.map((field) => (
                                <div key={field.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`field-${field.id}`}
                                        checked={
                                            selectedFields.length === 0 || selectedFields.includes(field.id)
                                        }
                                        onCheckedChange={() => toggleField(field.id)}
                                    />
                                    <Label
                                        htmlFor={`field-${field.id}`}
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        {field.label}
                                        <span className="text-xs text-muted-foreground ml-2">
                                            ({field.type})
                                        </span>
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {selectedFields.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                                All fields will be exported
                            </p>
                        )}
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        <Label>Additional Options</Label>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="metadata"
                                checked={includeMetadata}
                                onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
                            />
                            <Label htmlFor="metadata" className="text-sm font-normal cursor-pointer">
                                Include metadata (IP address, user agent, timestamps)
                            </Label>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleExport} disabled={isExecuting}>
                        <Download className="h-4 w-4 mr-2" />
                        {isExecuting ? "Exporting..." : "Export"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function b64toBlob(b64Data: string, contentType = "", sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
}