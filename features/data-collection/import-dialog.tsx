"use client";

import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  parseImportFileAction,
  validateImportDataAction,
  executeImportAction,
} from "@/lib/services/actions/import.actions";
import { uploadFileWithFormData } from "@/lib/services/actions/upload-file.action";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Download, X } from "lucide-react";
import { toast } from "sonner";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string;
  formName: string;
  onImportComplete?: () => void;
}

type Step = "upload" | "mapping" | "validating" | "importing" | "results";

export function ImportDialog({
  open,
  onOpenChange,
  formId,
  formName,
  onImportComplete,
}: ImportDialogProps) {
  const [step, setStep] = useState<Step>("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [preview, setPreview] = useState<Record<string, any>[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [autoMapping, setAutoMapping] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [importResults, setImportResults] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { execute: parseFile, isExecuting: isParsing } = useAction(
    parseImportFileAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success && data.data) {
          setColumns(data.data.columns);
          setRowCount(data.data.rowCount);
          setPreview(data.data.preview);
          setAutoMapping(data.data.autoMapping);
          setColumnMapping(data.data.autoMapping); // Set initial mapping
          setSuggestions(data.data.suggestions);
          setStep("mapping");
          toast.success("File parsed successfully");
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Failed to parse file");
      },
    }
  );

  const { execute: validateData, isExecuting: isValidating } = useAction(
    validateImportDataAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success && data.data) {
          setValidationResults(data.data);
          setStep("validating");
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Failed to validate data");
      },
    }
  );

  const { execute: executeImport, isExecuting: isImporting } = useAction(
    executeImportAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success && data.data) {
          setImportResults(data.data);
          setStep("results");
          toast.success(data.data.message || "Import completed");
          if (onImportComplete) {
            onImportComplete();
          }
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Failed to import data");
        setStep("results");
        setImportResults({
          imported: 0,
          failed: rowCount,
          message: error.serverError || "Import failed",
        });
      },
    }
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error("Please upload an Excel (.xlsx, .xls) or CSV file");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);

    try {
      // ✅ Upload via server action (proper pattern)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("formId", formId);

      const result = await uploadFileWithFormData(formData);

      if (result.error) {
        toast.error(result.error);
        setIsUploading(false);
        return;
      }

      if (result.success && result.data) {
        setFileId(result.data.fileId);

        // Parse file
        parseFile({ formId, fileId: result.data.fileId });
      }
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to upload file");
      setIsUploading(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleValidate = () => {
    if (!fileId) return;

    validateData({
      formId,
      fileId,
      columnMapping,
    });
  };

  const handleImport = () => {
    if (!fileId) return;

    setStep("importing");
    executeImport({
      formId,
      fileId,
      columnMapping,
      skipEmptyRows: true,
      updateExisting: false,
      createMissingFields: false,
    });
  };

  const handleDownloadErrorReport = () => {
    if (!importResults?.errorReportData) return;

    const blob = new Blob(
      [Buffer.from(importResults.errorReportData, "base64").toString("utf-8")],
      { type: "text/csv" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = importResults.errorReportFilename || "import_errors.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setStep("upload");
    setUploadedFile(null);
    setFileId(null);
    setColumns([]);
    setPreview([]);
    setColumnMapping({});
    setValidationResults(null);
    setImportResults(null);
    onOpenChange(false);
  };

  const mappedFieldCount = Object.values(columnMapping).filter(
    (value) => value && value !== "__skip__"
  ).length;
  const unmappedFieldCount = columns.length - mappedFieldCount;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Data to {formName}</DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file to import data into this form
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-sm">
            <div className={`flex items-center gap-2 ${step === "upload" ? "text-primary font-medium" : step !== "upload" as string ? "text-muted-foreground" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "upload" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                1
              </div>
              <span>Upload</span>
            </div>
            <div className="flex-1 h-px bg-border mx-4" />
            <div className={`flex items-center gap-2 ${step === "mapping" ? "text-primary font-medium" : step === "validating" || step === "importing" || step === "results" ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "mapping" ? "bg-primary text-primary-foreground" : step === "validating" || step === "importing" || step === "results" ? "bg-muted" : "bg-muted/50"}`}>
                2
              </div>
              <span>Map Columns</span>
            </div>
            <div className="flex-1 h-px bg-border mx-4" />
            <div className={`flex items-center gap-2 ${step === "validating" ? "text-primary font-medium" : step === "importing" || step === "results" ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "validating" ? "bg-primary text-primary-foreground" : step === "importing" || step === "results" ? "bg-muted" : "bg-muted/50"}`}>
                3
              </div>
              <span>Validate</span>
            </div>
            <div className="flex-1 h-px bg-border mx-4" />
            <div className={`flex items-center gap-2 ${step === "importing" || step === "results" ? "text-primary font-medium" : "text-muted-foreground/50"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "importing" || step === "results" ? "bg-primary text-primary-foreground" : "bg-muted/50"}`}>
                4
              </div>
              <span>Import</span>
            </div>
          </div>

          {/* Step 1: Upload */}
          {step === "upload" && (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-12 text-center">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Import File</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports Excel (.xlsx, .xls) and CSV files up to 10MB
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading || isParsing}
                />
                <label htmlFor="file-upload">
                  <Button asChild disabled={isUploading || isParsing}>
                    <span>
                      {isUploading || isParsing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {isUploading ? "Uploading..." : "Parsing..."}
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important Notes</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                    <li>First row should contain column headers</li>
                    <li>File upload fields will be skipped (cannot import files via CSV)</li>
                    <li>Date format: YYYY-MM-DD, MM/DD/YYYY, or DD-MM-YYYY</li>
                    <li>Boolean values: true/false, yes/no, 1/0</li>
                    <li>Multi-select values: comma or semicolon separated</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {step === "mapping" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Map Columns to Fields</h3>
                  <p className="text-sm text-muted-foreground">
                    {rowCount} rows detected • {mappedFieldCount} fields mapped
                  </p>
                </div>
                {uploadedFile && (
                  <Badge variant="outline">{uploadedFile.name}</Badge>
                )}
              </div>

              <ScrollArea className="h-[400px] border rounded-lg p-4">
                <div className="space-y-3">
                  {columns.map((column) => {
                    const suggestion = suggestions.find((s) => s.csvColumn === column);
                    return (
                      <div key={column} className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="font-medium text-sm mb-1">{column}</div>
                          <div className="text-xs text-muted-foreground">
                            {preview[0]?.[column] ? `Example: ${preview[0][column]}` : "No data"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs text-muted-foreground">→</span>
                          <Select
                            value={columnMapping[column] || ""}
                            onValueChange={(value) => {
                              setColumnMapping((prev) => ({
                                ...prev,
                                [column]: value,
                              }));
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Don't import" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__skip__">Don't import</SelectItem>
                              {/* Note: Field options would come from form fields prop */}
                            </SelectContent>
                          </Select>
                          {suggestion && (
                            <Badge
                              variant={
                                suggestion.confidence === "high"
                                  ? "default"
                                  : suggestion.confidence === "medium"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {suggestion.confidence}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Step 3: Validation Results */}
          {step === "validating" && validationResults && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {validationResults.validRowCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Valid Rows</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-2xl font-bold text-destructive">
                    {validationResults.invalidRowCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Invalid Rows</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-2xl font-bold">
                    {rowCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Rows</div>
                </div>
              </div>

              {validationResults.warnings.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Warnings</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside text-sm mt-2">
                      {validationResults.warnings.map((warning: string, index: number) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validationResults.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">
                    Validation Errors (first 100)
                  </h4>
                  <ScrollArea className="h-[300px] border rounded-lg p-4">
                    <div className="space-y-2">
                      {validationResults.errors.map((error: any, index: number) => (
                        <div key={index} className="text-sm border-l-2 border-destructive pl-3 py-1">
                          <div className="font-medium">Row {error.row}: {error.field}</div>
                          <div className="text-muted-foreground">{error.error}</div>
                          {error.suggestion && (
                            <div className="text-xs text-muted-foreground italic">
                              Suggestion: {error.suggestion}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Importing Progress */}
          {step === "importing" && (
            <div className="space-y-4">
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
                <h3 className="text-lg font-medium mb-2">Importing Data...</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we import your data
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Results */}
          {step === "results" && importResults && (
            <div className="space-y-4">
              <div className="text-center py-8">
                {importResults.imported > 0 ? (
                  <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                ) : (
                  <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                )}
                <h3 className="text-xl font-medium mb-2">
                  {importResults.imported > 0 ? "Import Completed" : "Import Failed"}
                </h3>
                <p className="text-muted-foreground">{importResults.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {importResults.imported}
                  </div>
                  <div className="text-sm text-muted-foreground">Successfully Imported</div>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-destructive">
                    {importResults.failed}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>

              {importResults.errorReportData && (
                <Button
                  onClick={handleDownloadErrorReport}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Error Report
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}

          {step === "mapping" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button
                onClick={handleValidate}
                disabled={isValidating || mappedFieldCount === 0}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Validate Data"
                )}
              </Button>
            </>
          )}

          {step === "validating" && (
            <>
              <Button variant="outline" onClick={() => setStep("mapping")}>
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={validationResults?.validRowCount === 0}
              >
                Import {validationResults?.validRowCount} Valid Rows
              </Button>
            </>
          )}

          {step === "results" && (
            <Button onClick={handleClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
