import { ResetPasswordForm } from "@/features/auth/reset-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ResetPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ userId?: string; secret?: string }>;
}) {
    const { userId, secret } = await searchParams;

    if (!userId || !secret) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
                <Card className="w-full sm:max-w-md shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
                        <CardDescription>
                            This password reset link is invalid or has expired
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground text-center">
                            Password reset links expire after 1 hour for security reasons.
                            Please request a new reset link.
                        </p>
                        <div className="flex flex-col gap-2">
                            <Link href="/auth/forgot-password" className="w-full">
                                <Button className="w-full">
                                    Request New Reset Link
                                </Button>
                            </Link>
                            <Link href="/auth/sign-in" className="w-full">
                                <Button variant="outline" className="w-full">
                                    Back to Sign In
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <ResetPasswordForm userId={userId} secret={secret} />;
}