"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ResetPasswordInput, resetPasswordSchema } from "@/lib/schemas/user-schema";
import { resetPasswordAction } from "@/lib/services/actions/auth.actions";

interface ResetPasswordFormProps {
    userId: string;
    secret: string;
}

export function ResetPasswordForm({ userId, secret }: ResetPasswordFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();

    const form = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            userId,
            secret,
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(data: ResetPasswordInput) {
        try {
            const result = await resetPasswordAction(data);

            if (result?.data?.success) {
                toast.success("Password reset successful!", {
                    description: "You can now sign in with your new password.",
                });
                router.push("/auth/sign-in");
            } else if (result?.data?.error) {
                toast.error("Reset failed", {
                    description: result.data.error,
                });
            } else if (result?.serverError) {
                toast.error("Reset failed", {
                    description: result.serverError,
                });
            }
        } catch (error) {
            console.error("Reset password error:", error);
            toast.error("An error occurred. Please try again.");
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
            <Card className="w-full sm:max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                    <CardDescription>
                        Create a new password for your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        id="reset-password-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FieldGroup>
                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="password">New Password</FieldLabel>
                                        <InputGroup>
                                            <InputGroupAddon>
                                                <Lock className="h-4 w-4 text-muted-foreground" />
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                {...field}
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                aria-invalid={fieldState.invalid}
                                                placeholder="Enter new password"
                                                autoComplete="new-password"
                                                autoFocus
                                            />
                                            <InputGroupAddon align="inline-end">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
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
                                        {!fieldState.invalid && (
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

                        <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 p-3">
                            <p className="text-xs text-blue-900 dark:text-blue-100">
                                <strong>Security Notice:</strong> After resetting your password, you'll be logged out of all devices for security.
                            </p>
                        </div>
                    </form>
                </CardContent>

                <CardFooter>
                    <Button
                        type="submit"
                        form="reset-password-form"
                        className="w-full"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? "Resetting..." : "Reset Password"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}