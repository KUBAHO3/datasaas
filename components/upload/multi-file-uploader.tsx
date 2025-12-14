"use client";

import { Upload, X, FileText, Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// ✅ Support both File objects (new uploads) and existing file metadata
export interface ExistingFile {
    fileId: string;
    fileName: string;
    fileSize: number;
}

interface MultiFileUploaderProps {
    files: File[];
    existingFiles?: ExistingFile[]; // Files already uploaded to the server
    onChange: (files: File[]) => void;
    onRemoveExisting?: (fileId: string) => Promise<void>; // Callback to delete existing files
    caption?: string;
    maxFiles?: number;
    maxSize?: number;
    accept?: Record<string, string[]>;
    disabled?: boolean;
    className?: string;
}

export function MultiFileUploader({
    files = [],
    existingFiles = [],
    onChange,
    onRemoveExisting,
    caption,
    maxFiles = 5,
    maxSize = 10,
    accept = {
        "application/pdf": [".pdf"],
    },
    disabled = false,
    className,
}: MultiFileUploaderProps) {
    const [error, setError] = useState<string | null>(null);
    const [removingFileId, setRemovingFileId] = useState<string | null>(null);

    const totalFiles = (existingFiles?.length || 0) + (files?.length || 0);

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: any[]) => {
            setError(null);

            if (rejectedFiles.length > 0) {
                const rejection = rejectedFiles[0];
                if (rejection.errors[0]?.code === "file-too-large") {
                    setError(`File size must be less than ${maxSize}MB`);
                } else if (rejection.errors[0]?.code === "file-invalid-type") {
                    setError("Invalid file type");
                } else if (rejection.errors[0]?.code === "too-many-files") {
                    setError(`Maximum ${maxFiles} files allowed`);
                } else {
                    setError("File rejected");
                }
                return;
            }

            const currentFiles = files || [];
            const remainingSlots = maxFiles - totalFiles;
            const newFiles = [...currentFiles, ...acceptedFiles].slice(0, remainingSlots + currentFiles.length);
            onChange(newFiles);
        },
        [files, maxFiles, maxSize, onChange, totalFiles]
    );

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        onChange(newFiles);
        setError(null);
    };

    const removeExistingFile = async (fileId: string) => {
        if (!onRemoveExisting) return;

        setRemovingFileId(fileId);
        try {
            await onRemoveExisting(fileId);
            setError(null);
        } catch (error) {
            console.error("Failed to remove file:", error);
            setError("Failed to remove file");
        } finally {
            setRemovingFileId(null);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles: maxFiles - totalFiles,
        maxSize: maxSize * 1024 * 1024,
        disabled: disabled || totalFiles >= maxFiles,
    });

    const formatFileSize = (bytes: number) => {
        const sizeInMB = bytes / (1024 * 1024);
        return sizeInMB < 1
            ? `${(bytes / 1024).toFixed(2)} KB`
            : `${sizeInMB.toFixed(2)} MB`;
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Header showing file count */}
            {totalFiles > 0 && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        {totalFiles} of {maxFiles} files uploaded
                    </span>
                    {totalFiles < maxFiles && (
                        <span className="text-xs text-muted-foreground">
                            {maxFiles - totalFiles} slots remaining
                        </span>
                    )}
                </div>
            )}

            {/* Existing files from server */}
            {existingFiles && existingFiles.length > 0 && (
                <div className="space-y-2">
                    {existingFiles.map((file) => (
                        <div
                            key={file.fileId}
                            className="relative flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                                <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {file.fileName}
                                </p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(file.fileSize)}
                                    </p>
                                    <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                                        Uploaded
                                    </span>
                                </div>
                            </div>
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            onClick={() => removeExistingFile(file.fileId)}
                                            disabled={disabled || removingFileId === file.fileId}
                                            className="flex h-8 w-8 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 hover:bg-destructive/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {removingFileId === file.fileId ? (
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                                            ) : (
                                                <X className="h-4 w-4 text-destructive" />
                                            )}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Remove file</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    ))}
                </div>
            )}

            {/* New files (not yet uploaded) */}
            {files && files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="relative flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {file.name}
                                </p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(file.size)}
                                    </p>
                                    <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600">
                                        Ready to upload
                                    </span>
                                </div>
                            </div>
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            disabled={disabled}
                                            className="flex h-8 w-8 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 hover:bg-destructive/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <X className="h-4 w-4 text-destructive" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Remove file</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload area - show button if files exist, dropzone if none */}
            {totalFiles < maxFiles && (
                <div
                    {...getRootProps()}
                    className={cn(
                        "flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors cursor-pointer",
                        totalFiles > 0 ? "p-4" : "p-8",
                        isDragActive && "border-primary bg-primary/5",
                        (disabled || totalFiles >= maxFiles) &&
                        "opacity-50 cursor-not-allowed"
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className={cn(
                            "flex items-center justify-center rounded-full bg-primary/10",
                            totalFiles > 0 ? "h-10 w-10" : "h-12 w-12"
                        )}>
                            {totalFiles > 0 ? (
                                <Plus className="h-5 w-5 text-primary" />
                            ) : (
                                <Upload className="h-6 w-6 text-primary" />
                            )}
                        </div>
                        <div>
                            <p className={cn(
                                "font-medium",
                                totalFiles > 0 ? "text-xs" : "text-sm"
                            )}>
                                {totalFiles > 0 ? (
                                    <>
                                        <span className="text-primary">Add more files</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-primary">Click to upload</span> or drag and drop
                                    </>
                                )}
                            </p>
                            {totalFiles === 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {caption ||
                                        `PDF only (max ${maxSize}MB per file, ${maxFiles} files total)`}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    )
}