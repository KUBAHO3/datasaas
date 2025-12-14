"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileIcon, ImageIcon, Loader2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FilePreviewProps {
  fileId: string;
  bucketId: string;
  fileName?: string;
  fileType?: string;
  className?: string;
}

export function FilePreview({
  fileId,
  bucketId,
  fileName,
  fileType,
  className,
}: FilePreviewProps) {
  const [fileUrl, setFileUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

    if (!endpoint || !projectId) {
      setError("Appwrite configuration missing");
      setLoading(false);
      return;
    }

    // Generate file view URL
    const viewUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
    setFileUrl(viewUrl);
    setLoading(false);
  }, [fileId, bucketId]);

  const handleDownload = () => {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

    if (!endpoint || !projectId) return;

    const downloadUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/download?project=${projectId}`;
    window.open(downloadUrl, "_blank");
  };

  const isImage = fileType?.startsWith("image/") || false;

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-muted-foreground">Loading file...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-destructive", className)}>
        <FileIcon className="h-4 w-4" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {isImage ? (
        <div className="space-y-2">
          <div className="relative w-full max-w-md rounded-lg border overflow-hidden bg-muted">
            <img
              src={fileUrl}
              alt={fileName || "Uploaded image"}
              className="w-full h-auto object-contain max-h-64"
              loading="lazy"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {fileName && (
              <Badge variant="secondary" className="text-xs">
                <ImageIcon className="h-3 w-3 mr-1" />
                {fileName}
              </Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="h-7"
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open(fileUrl, "_blank")}
              className="h-7"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
          <FileIcon className="h-8 w-8 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            {fileName && (
              <p className="text-sm font-medium truncate">{fileName}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {fileType || "Unknown type"}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="h-8"
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open(fileUrl, "_blank")}
              className="h-8"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface FileListPreviewProps {
  fileIds: string[];
  bucketId: string;
  className?: string;
}

export function FileListPreview({
  fileIds,
  bucketId,
  className,
}: FileListPreviewProps) {
  if (!fileIds || fileIds.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">No files uploaded</p>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {fileIds.map((fileId, index) => (
        <FilePreview
          key={fileId}
          fileId={fileId}
          bucketId={bucketId}
          fileName={`File ${index + 1}`}
        />
      ))}
    </div>
  );
}
