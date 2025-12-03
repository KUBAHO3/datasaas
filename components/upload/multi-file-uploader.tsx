"use client";

import { Upload, X, FileText } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MultiFileUploaderProps {
    files: File[];
    onChange: (files: File[]) => void;
    caption?: string;
    maxFiles?: number;
    maxSize?: number;
    accept?: Record<string, string[]>;
    disabled?: boolean;
    className?: string;
}

export function MultiFileUploader({
    files = [],
    onChange,
    caption,
    maxFiles = 5,
    maxSize = 10,
    accept = {
        "application/pdf": [".pdf"],
        "application/msword": [".doc"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
            ".docx",
        ],
    },
    disabled = false,
    className,
}: MultiFileUploaderProps) {
    const [error, setError] = useState<string | null>(null);

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
            const newFiles = [...currentFiles, ...acceptedFiles].slice(0, maxFiles);
            onChange(newFiles);
        },
        [files, maxFiles, maxSize, onChange]
    );

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        onChange(newFiles);
        setError(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles: maxFiles - (files?.length || 0),
        maxSize: maxSize * 1024 * 1024,
        disabled: disabled || files?.length >= maxFiles,
    });

    const formatFileSize = (bytes: number) => {
        const sizeInMB = bytes / (1024 * 1024);
        return sizeInMB < 1
            ? `${(bytes / 1024).toFixed(2)} KB`
            : `${sizeInMB.toFixed(2)} MB`;
    };

    return (
        <div className={cn("space-y-4", className)}>
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
                                <p className="text-xs text-muted-foreground">
                                    {formatFileSize(file.size)}
                                </p>
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

            {(!files || files.length < maxFiles) && (
                <div
                    {...getRootProps()}
                    className={cn(
                        "flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-8 transition-colors cursor-pointer",
                        isDragActive && "border-primary bg-primary/5",
                        (disabled || files?.length >= maxFiles) &&
                        "opacity-50 cursor-not-allowed"
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">
                                <span className="text-primary">Click to upload</span> or drag
                                and drop
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {caption ||
                                    `PDF, DOC, DOCX (max ${maxSize}MB per file, ${maxFiles} files total)`}
                            </p>
                            {files && files.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {files.length} of {maxFiles} files uploaded
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