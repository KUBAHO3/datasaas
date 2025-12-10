"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Archive, Trash2, CheckCircle } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { publishFormAction, archiveFormAction, deleteFormAction } from "@/lib/services/actions/form.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FormActionButtonsProps {
    formId: string;
    status: "draft" | "published" | "archived";
    orgId: string;
}

export function FormActionButtons({ formId, status, orgId }: FormActionButtonsProps) {
    const router = useRouter();

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
                router.refresh();
            } else {
                toast.error(data?.error || "Failed to delete form");
            }
        },
    });

    return (
        <>
            {status === "draft" && (
                <>
                    <DropdownMenuItem
                        onClick={() => publish({ formId })}
                        disabled={isPublishing}
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Publish
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => deleteForm({ formId })}
                        disabled={isDeleting}
                        className="text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </>
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
        </>
    );
}