"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signInFormSchema } from "@/lib/schemas/user-schema";
import { toast } from "sonner";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Eye, EyeOff, Lock, MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as z from "zod"
import { signInAction } from "@/lib/services/actions/auth.actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";

type SignInFormValues = z.infer<typeof signInFormSchema>

export function SignInCard() {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const form = useForm<SignInFormValues>({
        resolver: zodResolver(signInFormSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const { execute: signIn, isExecuting: isSigningIn } = useAction(signInAction, {
        onSuccess: ({ data }) => {
            if (data?.success && data.user) {
                toast.success("Sign in successful!", {
                    description: `Welcome back, ${data.user.name}!`,
                });

                if (data.user.isSuperAdmin) {
                    router.push("/admin");
                } else {
                    router.push(data.user.companyId ? `/org/${data.user.companyId}` : '/');
                }
            } else if (data?.error) {
                toast.error("Sign in failed", {
                    description: data.error,
                });
            }
        },
        onError: ({ error }) => {
            toast.error("Sign in failed", {
                description: error.serverError || "An error occurred during sign in",
            });
        },
    });

    function onSubmit(data: SignInFormValues) {
        signIn(data);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4">
            <Card className="w-full sm:max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        id="sign-in-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FieldGroup>
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="email">Email</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                {...field}
                                                type="email"
                                                placeholder="Enter your email"
                                                id="email"
                                                aria-invalid={fieldState.invalid}
                                                autoComplete="email"
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

                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="password">Password</FieldLabel>
                                        <InputGroup>
                                            <InputGroupAddon>
                                                <Lock className="h-4 w-4 text-muted-foreground" />
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                {...field}
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                aria-invalid={fieldState.invalid}
                                                placeholder="••••••••"
                                                autoComplete="current-password"
                                            />
                                            <InputGroupAddon align={'inline-end'}>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
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
                                    </Field>
                                )}
                            />
                        </FieldGroup>

                        <div className="mt-4 flex items-center justify-between">
                            <Link href="/auth/forgot-password">
                                <Button
                                    type="button"
                                    variant="link"
                                    className="h-auto ml-auto p-0 text-sm"
                                >
                                    Forgot password?
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <Button
                        type="submit"
                        form="sign-in-form"
                        className="w-full"
                        disabled={isSigningIn}
                    >
                        {isSigningIn ? "Signing in..." : "Sign In"}
                    </Button>

                    <div className="flex items-center gap-3 before:h-px w-full before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                        <span className="text-xs text-muted-foreground">Or</span>
                    </div>

                    <Button variant="outline" type="button" disabled={isSigningIn} className="w-full">
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/sign-up">
                            <Button variant="link" className="h-auto p-0 text-sm font-semibold">
                                Sign up
                            </Button>
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}