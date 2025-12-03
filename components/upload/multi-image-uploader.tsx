"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PreviewImage {
    file: File;
    preview: string;
}

interface MultiImageUploaderProps {
    files: File[];
    onChange: (files: File[]) => void;
    caption?: string;
    maxFiles?: number;
    maxSize?: number;
    imageWidth?: number;
    imageHeight?: number;
    disabled?: boolean;
    className?: string;
}

export function MultiImageUploader({
    files = [],
    onChange,
    caption,
    maxFiles = 5,
    maxSize = 5,
    imageWidth = 150,
    imageHeight = 150,
    disabled = false,
    className,
}: MultiImageUploaderProps) {
    const [error, setError] = useState<string | null>(null);
    const [previews, setPreviews] = useState<PreviewImage[]>([]);

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: any[]) => {
            setError(null);

            if (rejectedFiles.length > 0) {
                const rejection = rejectedFiles[0];
                if (rejection.errors[0]?.code === "file-too-large") {
                    setError(`Image size must be less than ${maxSize}MB`);
                } else if (rejection.errors[0]?.code === "file-invalid-type") {
                    setError("Invalid file type. Only images are allowed.");
                } else if (rejection.errors[0]?.code === "too-many-files") {
                    setError(`Maximum ${maxFiles} images allowed`);
                } else {
                    setError("File rejected");
                }
                return;
            }

            const currentFiles = files || [];
            const newFiles = [...currentFiles, ...acceptedFiles].slice(0, maxFiles);
            onChange(newFiles);

            const newPreviews: PreviewImage[] = [];
            acceptedFiles.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newPreviews.push({
                        file,
                        preview: reader.result as string,
                    });
                    if (newPreviews.length === acceptedFiles.length) {
                        setPreviews((prev) => [...prev, ...newPreviews]);
                    }
                };
                reader.readAsDataURL(file);
            });
        },
        [files, maxFiles, maxSize, onChange]
    );

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        onChange(newFiles);
        setPreviews(newPreviews);
        setError(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".gif", ".svg"],
        },
        maxFiles: maxFiles - (files?.length || 0),
        maxSize: maxSize * 1024 * 1024,
        disabled: disabled || files?.length >= maxFiles,
    });

    return (
        <div className={cn("space-y-4", className)}>
            {previews && previews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {previews.map((previewImage, index) => (
                        <div key={index} className="relative group">
                            <div className="relative">
                                <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                disabled={disabled}
                                                className="absolute -right-2 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-destructive/20 bg-destructive text-destructive-foreground shadow-md opacity-0 group-hover:opacity-100 hover:bg-destructive/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>Remove image</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <Image
                                    src={previewImage.preview}
                                    width={imageWidth}
                                    height={imageHeight}
                                    alt={`Preview ${index + 1}`}
                                    className="rounded-lg object-cover border border-border"
                                    style={{ width: imageWidth, height: imageHeight }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                                {previewImage.file.name}
                            </p>
                        </div>
                    ))}

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
                                            `PNG, JPG, GIF, SVG (max ${maxSize}MB per image, ${maxFiles} images total)`}
                                    </p>
                                    {files && files.length > 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {files.length} of {maxFiles} images uploaded
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    )
}