"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { uploadFileWithFormData } from "@/lib/services/actions/upload-file.action";
import {
  analyzeImportFileAction,
  createFormFromImportAction,
} from "@/lib/services/actions/auto-import.actions";
import type { DetectedField } from "@/lib/services/import/field-detector.service";
import { useRouter } from "next/navigation";

interface AutoImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onImportComplete?: () => void;
}

type Step = "upload" | "review" | "customize" | "creating";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Long Text" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "url", label: "URL" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
  { value: "datetime", label: "Date & Time" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio" },
  { value: "dropdown", label: "Dropdown" },
  { value: "file", label: "File Upload" },
] as const;

export function AutoImportDialog({
  open,
  onOpenChange,
  companyId,
  onImportComplete,
}: AutoImportDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Analysis results
  const [columns, setColumns] = useState<string[]>([]);
  const [preview, setPreview] = useState<Record<string, any>[]>([]);
  const [detectedFields, setDetectedFields] = useState<DetectedField[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Form customization
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [fields, setFields] = useState<DetectedField[]>([]);
  const [importData, setImportData] = useState(true);

  const { execute: analyzeFile, isExecuting: isAnalyzing } = useAction(
    analyzeImportFileAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success && data.data) {
          setColumns(data.data.columns);
          setPreview(data.data.preview);
          setDetectedFields(data.data.detectedFields);
          setWarnings(data.data.warnings);
          setFormName(data.data.suggestedFormName);
          setFields(data.data.detectedFields);
          setStep("review");
          toast.success("File analyzed successfully!");
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Failed to analyze file");
        setIsUploading(false);
      },
    }
  );

  const { execute: createForm, isExecuting: isCreating } = useAction(
    createFormFromImportAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success && data.data) {
          toast.success(data.message || "Form created successfully!");
          onOpenChange(false);
          // Call the callback if provided
          onImportComplete?.();
          // Redirect to the new form's data collection page
          router.push(`/org/${companyId}/data-collection?form=${data.data.formId}`);
          router.refresh();
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Failed to create form");
      },
    }
  );

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast.error("Only Excel and CSV files are allowed");
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
      formData.append("formId", "auto-import"); // Special ID for auto-import
      formData.append("companyId", companyId);

      const result = await uploadFileWithFormData(formData);

      if (result.error) {
        toast.error(result.error);
        setIsUploading(false);
        return;
      }

      if (result.success && result.data) {
        setFileId(result.data.fileId);

        // Analyze file
        analyzeFile({
          fileId: result.data.fileId,
          fileName: file.name,
          companyId,
        });
      }
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to upload file");
      setIsUploading(false);
    }
  };

  const handleCreate = () => {
    if (!fileId || !formName.trim()) {
      toast.error("Please provide a form name");
      return;
    }

    setStep("creating");

    // Build column mapping
    const columnMapping: Record<string, string> = {};
    columns.forEach((col, index) => {
      if (fields[index]) {
        columnMapping[col] = fields[index].name;
      }
    });

    createForm({
      fileId,
      formName: formName.trim(),
      formDescription: formDescription.trim(),
      fields: fields.map((f) => ({
        name: f.name,
        label: f.label,
        type: f.type,
        required: f.required,
        options: f.options,
      })),
      columnMapping,
      importData,
      companyId,
    });
  };

  const resetDialog = () => {
    setStep("upload");
    setUploadedFile(null);
    setFileId(null);
    setIsUploading(false);
    setColumns([]);
    setPreview([]);
    setDetectedFields([]);
    setWarnings([]);
    setFormName("");
    setFormDescription("");
    setFields([]);
    setImportData(true);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetDialog();
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Auto-Create Form from Import
          </DialogTitle>
          <DialogDescription>
            Upload your Excel or CSV file, and we'll automatically detect field types
            and create a form for you.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-4">
          {step === "upload" && (
            <UploadStep
              onFileSelect={handleFileSelect}
              isUploading={isUploading || isAnalyzing}
              uploadedFile={uploadedFile}
            />
          )}

          {step === "review" && (
            <ReviewStep
              formName={formName}
              setFormName={setFormName}
              formDescription={formDescription}
              setFormDescription={setFormDescription}
              fields={fields}
              preview={preview}
              warnings={warnings}
              importData={importData}
              setImportData={setImportData}
              onNext={() => setStep("customize")}
              onCreate={handleCreate}
            />
          )}

          {step === "customize" && (
            <CustomizeStep
              fields={fields}
              setFields={setFields}
              onBack={() => setStep("review")}
              onCreate={handleCreate}
            />
          )}

          {step === "creating" && (
            <CreatingStep isCreating={isCreating} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UploadStep({
  onFileSelect,
  isUploading,
  uploadedFile,
}: {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  uploadedFile: File | null;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center ${
              isUploading
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary hover:bg-accent/50"
            } transition-colors cursor-pointer`}
            onClick={() => {
              if (!isUploading) {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".csv,.xlsx,.xls";
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) onFileSelect(file);
                };
                input.click();
              }
            }}
          >
            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
                <div>
                  <p className="font-medium">Analyzing file...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {uploadedFile?.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Excel (.xlsx, .xls) or CSV files up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div>
              <p className="font-medium">Upload your file</p>
              <p className="text-sm text-muted-foreground">
                Excel or CSV with your data
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div>
              <p className="font-medium">We analyze your data</p>
              <p className="text-sm text-muted-foreground">
                Automatically detect field types (text, number, email, etc.)
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div>
              <p className="font-medium">Review & customize</p>
              <p className="text-sm text-muted-foreground">
                Adjust field types, labels, and settings
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
              4
            </div>
            <div>
              <p className="font-medium">Form created!</p>
              <p className="text-sm text-muted-foreground">
                Your data is imported and ready to use
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewStep({
  formName,
  setFormName,
  formDescription,
  setFormDescription,
  fields,
  preview,
  warnings,
  importData,
  setImportData,
  onNext,
  onCreate,
}: {
  formName: string;
  setFormName: (name: string) => void;
  formDescription: string;
  setFormDescription: (desc: string) => void;
  fields: DetectedField[];
  preview: Record<string, any>[];
  warnings: string[];
  importData: boolean;
  setImportData: (value: boolean) => void;
  onNext: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Form Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Form Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="formName">Form Name *</Label>
            <Input
              id="formName"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Enter form name"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="formDescription">Description (Optional)</Label>
            <Textarea
              id="formDescription"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Describe what this form is for..."
              className="mt-1.5"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detected Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Detected Fields ({fields.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{field.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {field.name}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={field.required ? "default" : "secondary"}>
                    {field.required ? "Required" : "Optional"}
                  </Badge>
                  <Badge variant="outline">{field.type}</Badge>
                  {field.confidence < 0.7 && (
                    <Badge variant="destructive" className="text-xs">
                      Low confidence
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-4 w-4" />
              Warnings ({warnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-orange-700">
              {warnings.slice(0, 5).map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {fields.map((field, index) => (
                    <th key={index} className="text-left p-2 font-medium">
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 3).map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b">
                    {Object.values(row).map((value: any, colIndex) => (
                      <td key={colIndex} className="p-2 text-muted-foreground">
                        {String(value).slice(0, 50)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Import Data Option */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Checkbox
              id="importData"
              checked={importData}
              onCheckedChange={(checked) => setImportData(checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="importData" className="cursor-pointer">
                Import data immediately
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Create the form and import all {preview.length} rows as submissions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onNext}>
          Customize Fields
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
        <Button onClick={onCreate} disabled={!formName.trim()}>
          Create Form & Import
        </Button>
      </div>
    </div>
  );
}

function CustomizeStep({
  fields,
  setFields,
  onBack,
  onCreate,
}: {
  fields: DetectedField[];
  setFields: (fields: DetectedField[]) => void;
  onBack: () => void;
  onCreate: () => void;
}) {
  const updateField = (index: number, updates: Partial<DetectedField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customize Fields</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Field Label</Label>
                  <Input
                    value={field.label}
                    onChange={(e) =>
                      updateField(index, { label: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Field Type</Label>
                  <Select
                    value={field.type}
                    onValueChange={(value) =>
                      updateField(index, { type: value as any })
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`required-${index}`}
                  checked={field.required}
                  onCheckedChange={(checked) =>
                    updateField(index, { required: checked as boolean })
                  }
                />
                <Label htmlFor={`required-${index}`} className="cursor-pointer">
                  Required field
                </Label>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onCreate}>Create Form & Import</Button>
      </div>
    </div>
  );
}

function CreatingStep({ isCreating }: { isCreating: boolean }) {
  return (
    <div className="py-12 text-center space-y-4">
      <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin" />
      <div>
        <p className="font-medium text-lg">Creating your form...</p>
        <p className="text-sm text-muted-foreground mt-2">
          {isCreating
            ? "Importing data and setting up your form"
            : "This may take a moment for large files"}
        </p>
      </div>
    </div>
  );
}
