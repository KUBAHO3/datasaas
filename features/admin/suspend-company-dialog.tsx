"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2, PauseCircle } from "lucide-react";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { suspendCompanySchema } from "@/lib/schemas/company-schemas";
import { suspendCompanyAction } from "@/lib/services/actions/company.actions";
import { Company } from "@/lib/types/company-types";
import * as z from "zod";
import { Label } from "@/components/ui/label";

interface SuspendCompanyDialogProps {
    company: Company;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

type SuspendFormData = z.infer<typeof suspendCompanySchema>;

export function SuspendCompanyDialog({
    company,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange
}: SuspendCompanyDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);

    // Use controlled state if provided, otherwise use internal state
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = (value: boolean) => {
        if (controlledOnOpenChange) {
            controlledOnOpenChange(value);
        } else {
            setInternalOpen(value);
        }
    };

    const router = useRouter();

    const form = useForm<SuspendFormData>({
        resolver: zodResolver(suspendCompanySchema),
        defaultValues: {
            companyId: company.$id,
            reason: "",
        },
    });

    const { execute, status } = useAction(suspendCompanyAction, {
        onSuccess: ({ data }) => {
            if (data?.success) {
                toast.success(data.message || "Company suspended successfully");
                setOpen(false);
                form.reset();
                router.refresh();
            } else if (data?.error) {
                toast.error(data.error);
            }
        },
        onError: () => {
            toast.error("Failed to suspend company");
        },
    });

    const onSubmit = (data: SuspendFormData) => {
        execute(data);
    };

    const isLoading = status === "executing";
    const canSuspend = company.status === "active";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!canSuspend}
                    className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                    <PauseCircle className="h-4 w-4 mr-2" />
                    Suspend
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="h-5 w-5" />
                        Suspend Company
                    </DialogTitle>
                    <DialogDescription>
                        Temporarily suspend this company's access to the platform.
                    </DialogDescription>
                </DialogHeader>

                {!canSuspend && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Only active companies can be suspended. Current status:{" "}
                            <strong>{company.status}</strong>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <div className="text-sm">
                            <span className="font-medium">Company:</span> {company.companyName}
                        </div>
                        <div className="text-sm">
                            <span className="font-medium">Current Status:</span>{" "}
                            <span className="text-green-600">{company.status}</span>
                        </div>
                    </div>

                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="space-y-2">
                            <p className="font-medium">Suspending will:</p>
                            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                                <li>Immediately block all company access</li>
                                <li>Prevent team members from logging in</li>
                                <li>Preserve all data (no data loss)</li>
                                <li>Send suspension notification email</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <Field>
                            <Label htmlFor="reason">Suspension Reason *</Label>
                            <Textarea
                                id="reason"
                                placeholder="Provide a detailed reason for suspension..."
                                rows={4}
                                {...form.register("reason")}
                            />
                            <FieldError>{form.formState.errors.reason?.message}</FieldError>
                        </Field>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="default"
                                className="bg-orange-600 hover:bg-orange-700"
                                disabled={isLoading}
                            >
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Suspend Company
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
