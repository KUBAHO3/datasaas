"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadAvatarAction, deleteAvatarAction } from "@/lib/services/actions/avatar.actions";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { getUserInitials } from "@/lib/utils/profile-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userName: string;
  onUploadSuccess?: (url: string) => void;
  onDeleteSuccess?: () => void;
}

export function AvatarUpload({
  currentAvatarUrl,
  userName,
  onUploadSuccess,
  onDeleteSuccess,
}: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);

    try {
      const result = await uploadAvatarAction({ file });

      if (result?.data?.error) {
        toast.error(result.data.error);
        setPreviewUrl(null);
      } else if (result?.data?.success && result?.data?.avatarUrl) {
        toast.success("Avatar uploaded successfully!");
        const urlWithTimestamp = `${result.data.avatarUrl}${result.data.avatarUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
        setAvatarUrl(urlWithTimestamp);
        setPreviewUrl(null);
        onUploadSuccess?.(result.data.avatarUrl);

        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      toast.error("Failed to upload avatar");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    setIsUploading(true);

    try {
      const result = await deleteAvatarAction();

      if (result?.data?.error) {
        toast.error(result.data.error);
      } else if (result?.data?.success) {
        toast.success("Avatar deleted successfully!");
        setAvatarUrl(undefined);
        onDeleteSuccess?.();
        setShowDeleteDialog(false);

        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      toast.error("Failed to delete avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={previewUrl || avatarUrl} alt={userName} />
        <AvatarFallback className="text-lg">
          {getUserInitials(userName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={triggerFileInput}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {avatarUrl ? "Change Photo" : "Upload Photo"}
            </>
          )}
        </Button>

        {avatarUrl && !isUploading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove Photo
          </Button>
        )}

        <p className="text-xs text-muted-foreground">
          JPG, PNG, WebP or GIF. Max size 5MB
        </p>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Avatar</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your profile picture? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUploading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isUploading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
