"use client";

import { useState } from "react";
import { Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { resendNotificationAction } from "@/lib/services/actions/company.actions";
import { Company } from "@/lib/types/company-types";

interface ResendNotificationButtonProps {
    company: Company;
}

type NotificationType = "approval" | "rejection" | "suspension" | "activation";

export function ResendNotificationButton({
    company,
}: ResendNotificationButtonProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<NotificationType | null>(
        null
    );

    const { execute, status } = useAction(resendNotificationAction, {
        onSuccess: ({ data }) => {
            if (data?.success) {
                toast.success(data.message || "Notification sent successfully");
                setDialogOpen(false);
                setSelectedType(null);
            } else if (data?.error) {
                toast.error(data.error);
            }
        },
        onError: () => {
            toast.error("Failed to send notification");
        },
    });

    const handleResend = (type: NotificationType) => {
        setSelectedType(type);
        setDialogOpen(true);
    };

    const confirmResend = () => {
        if (!selectedType) return;
        execute({
            companyId: company.$id,
            notificationType: selectedType,
        });
    };

    const isLoading = status === "executing";

    const getNotificationLabel = (type: NotificationType) => {
        const labels = {
            approval: "Approval Email",
            rejection: "Rejection Email",
            suspension: "Suspension Email",
            activation: "Activation Email",
        };
        return labels[type];
    };

    const canResend = (type: NotificationType): boolean => {
        switch (type) {
            case "approval":
            case "activation":
                return company.status === "active";
            case "rejection":
                return company.status === "rejected";
            case "suspension":
                return company.status === "suspended";
            default:
                return false;
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Resend Email
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Resend Notification</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => handleResend("approval")}
                        disabled={!canResend("approval")}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Approval Email
                        {company.status === "active" && (
                            <span className="ml-auto text-xs text-muted-foreground">
                                Available
                            </span>
                        )}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => handleResend("rejection")}
                        disabled={!canResend("rejection")}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Rejection Email
                        {company.status === "rejected" && (
                            <span className="ml-auto text-xs text-muted-foreground">
                                Available
                            </span>
                        )}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => handleResend("suspension")}
                        disabled={!canResend("suspension")}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Suspension Email
                        {company.status === "suspended" && (
                            <span className="ml-auto text-xs text-muted-foreground">
                                Available
                            </span>
                        )}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => handleResend("activation")}
                        disabled={!canResend("activation")}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Activation Email
                        {company.status === "active" && (
                            <span className="ml-auto text-xs text-muted-foreground">
                                Available
                            </span>
                        )}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Resend Notification Email</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to resend the{" "}
                            {selectedType && getNotificationLabel(selectedType).toLowerCase()}{" "}
                            to <strong>{company.companyName}</strong>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmResend} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Email
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}