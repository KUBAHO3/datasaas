"use client";

import { cn } from "@/lib/utils";
import { FileText, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface FileUploaderProps {
    file: File | string | null;
    onChange: (file: File | null) => void;
    onRemove?: () => void;
    caption?: string;
    accept?: Record<string, string[]>;
    maxSize?: number; // in MB
    disabled?: boolean;
    className?: string;
}

export function FileUploader({
    file,
    onChange,
    onRemove,
    caption,
    accept = {
        "application/pdf": [".pdf"],
    },
    maxSize = 10,
    disabled = false,
    className,
}: FileUploaderProps) {
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
                } else {
                    setError("File rejected");
                }
                return;
            }

            if (acceptedFiles.length > 0) {
                onChange(acceptedFiles[0]);
            }
        },
        [maxSize, onChange]
    );

    const removeFile = () => {
        onChange(null);
        if (onRemove) onRemove();
        setError(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles: 1,
        maxSize: maxSize * 1024 * 1024,
        disabled: disabled || !!file,
    });

    const getFileName = () => {
        if (file instanceof File) {
            return file.name;
        }
        if (typeof file === "string") {
            return file;
        }
        return null;
    };

    const getFileSize = () => {
        if (file instanceof File) {
            const sizeInMB = file.size / (1024 * 1024);
            return sizeInMB < 1
                ? `${(file.size / 1024).toFixed(2)} KB`
                : `${sizeInMB.toFixed(2)} MB`;
        }
        return null;
    };

    const fileName = getFileName();

    if (fileName) {
        return (
            <div className={cn("space-y-2", className)}>
                <div className="relative flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                            {fileName}
                        </p>
                        {getFileSize() && (
                            <p className="text-xs text-muted-foreground">{getFileSize()}</p>
                        )}
                    </div>
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={removeFile}
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
            </div>
        )
    }

    return (
        <div className={cn("space-y-2", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-8 transition-colors cursor-pointer",
                    isDragActive && "border-primary bg-primary/5",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">
                            <span className="text-primary">Click to upload</span> or drag and
                            drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {caption || `PDF only (max ${maxSize}MB)`}
                        </p>
                    </div>
                </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    )
}