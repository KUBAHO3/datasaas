"use client";

import { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Archive, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { publishFormAction, archiveFormAction, deleteFormAction } from "@/lib/services/actions/form.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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

interface FormActionButtonsProps {
    formId: string;
    status: "draft" | "published" | "archived";
    orgId: string;
}

export function FormActionButtons({ formId, status, orgId }: FormActionButtonsProps) {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { execute: publish, isExecuting: isPublishing } = useAction(publishFormAction, {
        onSuccess: ({ data }) => {
            if (data?.success) {
                toast.success("Form published successfully!");
                router.refresh();
            } else {
                toast.error(data?.error || "Failed to publish form");
            }
        },
    });

    const { execute: archive, isExecuting: isArchiving } = useAction(archiveFormAction, {
        onSuccess: ({ data }) => {
            if (data?.success) {
                toast.success("Form archived successfully!");
                router.refresh();
            } else {
                toast.error(data?.error || "Failed to archive form");
            }
        },
    });

    const { execute: deleteForm, isExecuting: isDeleting } = useAction(deleteFormAction, {
        onSuccess: ({ data }) => {
            if (data?.success) {
                toast.success("Form deleted successfully!");
                setShowDeleteDialog(false);
                router.refresh();
            } else {
                toast.error(data?.error || "Failed to delete form");
            }
        },
        onError: ({ error }) => {
            toast.error(error.serverError || "Failed to delete form");
        },
    });

    const handleDeleteConfirm = () => {
        deleteForm({ formId });
    };

    return (
        <>
            {status === "draft" && (
                <DropdownMenuItem
                    onClick={() => publish({ formId })}
                    disabled={isPublishing}
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Publish
                </DropdownMenuItem>
            )}

            {status === "published" && (
                <DropdownMenuItem
                    onClick={() => archive({ formId })}
                    disabled={isArchiving}
                >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                </DropdownMenuItem>
            )}

            {/* Delete option for all statuses */}
            <DropdownMenuItem
                onSelect={(e) => {
                    e.preventDefault();
                    setShowDeleteDialog(true);
                }}
                disabled={isDeleting}
                className="text-destructive focus:text-destructive"
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
            </DropdownMenuItem>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Delete Form?
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-2">
                                <p>
                                    This action cannot be undone. This will permanently delete the form
                                    and all its data.
                                </p>
                                {status === "published" && (
                                    <p className="text-destructive font-medium">
                                        Warning: This form is published and may have submissions. All
                                        submission data will also be deleted.
                                    </p>
                                )}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete Form"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}