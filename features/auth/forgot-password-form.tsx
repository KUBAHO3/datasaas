"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MailIcon, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ForgotPasswordInput, forgotPasswordSchema } from "@/lib/schemas/user-schema";
import { forgotPasswordAction } from "@/lib/services/actions/auth.actions";

export function ForgotPasswordForm() {
    const [emailSent, setEmailSent] = useState(false);

    const form = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(data: ForgotPasswordInput) {
        try {
            const result = await forgotPasswordAction(data);

            if (result?.data?.success) {
                setEmailSent(true);
                toast.success("Email sent!", {
                    description: result.data.message,
                });
            } else if (result?.data?.error) {
                toast.error("Request failed", {
                    description: result.data.error,
                });
            } else if (result?.serverError) {
                toast.error("Request failed", {
                    description: result.serverError,
                });
            }
        } catch (error) {
            console.error("Forgot password error:", error);
            toast.error("An error occurred. Please try again.");
        }
    }

    if (emailSent) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
                <Card className="w-full sm:max-w-md shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-2xl">Check Your Email</CardTitle>
                        <CardDescription>
                            We've sent password reset instructions to your email address
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 p-4">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                <strong>Next steps:</strong>
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200 list-disc list-inside">
                                <li>Check your inbox for the reset email</li>
                                <li>Click the reset link (expires in 1 hour)</li>
                                <li>Create your new password</li>
                            </ul>
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                            Didn't receive the email? Check your spam folder or try again.
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setEmailSent(false)}
                        >
                            Try Another Email
                        </Button>
                        <Link href="/auth/sign-in" className="w-full">
                            <Button variant="ghost" className="w-full">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Sign In
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
            <Card className="w-full sm:max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                    <CardDescription>
                        Enter your email address and we'll send you a link to reset your password
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        id="forgot-password-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FieldGroup>
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="email">Email Address</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                {...field}
                                                type="email"
                                                placeholder="Enter your email"
                                                id="email"
                                                aria-invalid={fieldState.invalid}
                                                autoComplete="email"
                                                autoFocus
                                            />
                                            <InputGroupAddon>
                                                <MailIcon />
                                            </InputGroupAddon>
                                        </InputGroup>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <Button
                        type="submit"
                        form="forgot-password-form"
                        className="w-full"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
                    </Button>

                    <Link href="/auth/sign-in" className="w-full">
                        <Button variant="ghost" className="w-full">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Sign In
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}