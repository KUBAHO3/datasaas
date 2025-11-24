"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, Shield } from "lucide-react";
import { useState } from "react";
import { ChangePasswordInput, changePasswordSchema } from "@/lib/schemas/user-schema";
import { changePasswordAction } from "@/lib/services/actions/auth.actions";

export function ChangePasswordForm() {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<ChangePasswordInput>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(data: ChangePasswordInput) {
        try {
            const result = await changePasswordAction(data);

            if (result?.data?.success) {
                toast.success("Password changed!", {
                    description: result.data.message,
                });
                form.reset();
            } else if (result?.data?.error) {
                toast.error("Change failed", {
                    description: result.data.error,
                });
            } else if (result?.serverError) {
                toast.error("Change failed", {
                    description: result.serverError,
                });
            }
        } catch (error) {
            console.error("Change password error:", error);
            toast.error("An error occurred. Please try again.");
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle>Change Password</CardTitle>
                </div>
                <CardDescription>
                    Update your password to keep your account secure
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FieldGroup>
                        <Controller
                            name="currentPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="currentPassword">
                                        Current Password
                                    </FieldLabel>
                                    <InputGroup>
                                        <InputGroupAddon>
                                            <Lock className="h-4 w-4 text-muted-foreground" />
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            {...field}
                                            id="currentPassword"
                                            type={showCurrentPassword ? "text" : "password"}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Enter current password"
                                            autoComplete="current-password"
                                        />
                                        <InputGroupAddon align="inline-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() =>
                                                    setShowCurrentPassword(!showCurrentPassword)
                                                }
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="newPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                                    <InputGroup>
                                        <InputGroupAddon>
                                            <Lock className="h-4 w-4 text-muted-foreground" />
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            {...field}
                                            id="newPassword"
                                            type={showNewPassword ? "text" : "password"}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Enter new password"
                                            autoComplete="new-password"
                                        />
                                        <InputGroupAddon align="inline-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                    {!fieldState.invalid && field.value && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Must be 8+ characters with uppercase, lowercase, and number
                                        </p>
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="confirmPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="confirmPassword">
                                        Confirm New Password
                                    </FieldLabel>
                                    <InputGroup>
                                        <InputGroupAddon>
                                            <Lock className="h-4 w-4 text-muted-foreground" />
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            {...field}
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Confirm new password"
                                            autoComplete="new-password"
                                        />
                                        <InputGroupAddon align="inline-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() =>
                                                    setShowConfirmPassword(!showConfirmPassword)
                                                }
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 p-4">
                        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                            Security Notice
                        </p>
                        <ul className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
                            <li>You'll be logged out of all other devices</li>
                            <li>Current session will remain active</li>
                            <li>Use a strong, unique password</li>
                        </ul>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => form.reset()}
                            disabled={form.formState.isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? "Changing..." : "Change Password"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}