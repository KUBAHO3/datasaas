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

interface ImageUploaderProps {
    file: File | string | null;
    onChange: (file: File | null) => void;
    onRemove?: () => void;
    caption?: string;
    imageWidth?: number;
    imageHeight?: number;
    maxSize?: number;
    disabled?: boolean;
    className?: string;
}

export function ImageUploader({
    file,
    onChange,
    onRemove,
    caption,
    imageWidth = 200,
    imageHeight = 200,
    maxSize = 5,
    disabled = false,
    className,
}: ImageUploaderProps) {
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: any[]) => {
            setError(null);

            if (rejectedFiles.length > 0) {
                const rejection = rejectedFiles[0];
                if (rejection.errors[0]?.code === "file-too-large") {
                    setError(`Image size must be less than ${maxSize}MB`);
                } else if (rejection.errors[0]?.code === "file-invalid-type") {
                    setError("Invalid file type. Only images are allowed.");
                } else {
                    setError("File rejected");
                }
                return;
            }

            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                onChange(file);

                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        },
        [maxSize, onChange]
    );

    const removeFile = () => {
        onChange(null);
        setPreview(null);
        if (onRemove) onRemove();
        setError(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".gif", ".svg"],
        },
        maxFiles: 1,
        maxSize: maxSize * 1024 * 1024,
        disabled: disabled || !!file,
    });

    const getImageSrc = () => {
        if (preview) return preview;
        if (typeof file === "string") return file;
        return null;
    };

    const imageSrc = getImageSrc();

    if (imageSrc) {
        return (
            <div className={cn("space-y-2", className)}>
                <div className="relative inline-block">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={removeFile}
                                    disabled={disabled}
                                    className="absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-destructive/20 bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Remove image</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Image
                        src={imageSrc}
                        width={imageWidth}
                        height={imageHeight}
                        alt="Uploaded image"
                        className="rounded-lg object-cover border border-border"
                        style={{ width: imageWidth, height: imageHeight }}
                    />
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
                            {caption || `PNG, JPG, GIF, SVG (max ${maxSize}MB)`}
                        </p>
                    </div>
                </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}