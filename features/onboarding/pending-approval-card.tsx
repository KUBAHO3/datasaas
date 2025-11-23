"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle2, XCircle, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { resubmitOnboarding } from "@/lib/services/actions/onboarding.actions";

interface PendingApprovalCardProps {
    status: 'in_progress' | 'submitted' | 'approved' | 'rejected';
    rejectionReason?: string;
}

export function PendingApprovalCard({ status, rejectionReason }: PendingApprovalCardProps) {
    const router = useRouter();

    const { execute: resubmit, isExecuting: isResubmitting } = useAction(resubmitOnboarding, {
        onSuccess: ({ data }) => {
            if (data?.success) {
                toast.success("Application resubmitted successfully!");
                router.refresh();
            } else if (data?.error) {
                toast.error(data.error);
            }
        },
        onError: ({ error }) => {
            toast.error(error.serverError || "Failed to resubmit application");
        },
    });

    useEffect(() => {
        if (status === 'submitted') {
            const interval = setInterval(() => {
                router.refresh();
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [status, router]);

    const handleRefresh = () => {
        router.refresh();
    };

    if (status === 'rejected') {
        return (
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                        <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle className="text-2xl">Application Rejected</CardTitle>
                    <CardDescription>
                        Your application needs some updates before approval
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {rejectionReason && (
                        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 p-4">
                            <div className="flex items-start gap-2 mb-2">
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                                    Reason for Rejection:
                                </p>
                            </div>
                            <p className="text-sm text-red-800 dark:text-red-200 ml-7">
                                {rejectionReason}
                            </p>
                        </div>
                    )}

                    <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 p-4">
                        <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                            What to do next?
                        </h3>
                        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 dark:text-blue-400">1.</span>
                                <span>Review the rejection reason above</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 dark:text-blue-400">2.</span>
                                <span>Update your application information</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 dark:text-blue-400">3.</span>
                                <span>Resubmit for review</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={() => router.push('/onboarding/step-2')}
                            className="w-full"
                        >
                            Update Application
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => resubmit()}
                            disabled={isResubmitting}
                            className="w-full"
                        >
                            {isResubmitting ? "Resubmitting..." : "Resubmit Without Changes"}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/')}
                            className="w-full"
                        >
                            Return Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (status === 'approved') {
        return (
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-2xl">Application Approved!</CardTitle>
                    <CardDescription>
                        Your company has been approved and is ready to use
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 p-4">
                        <p className="text-sm text-center">
                            Welcome to DataSaaS! You can now access your company dashboard and start building forms.
                        </p>
                    </div>
                    <Button className="w-full" onClick={() => router.push('/dashboard')}>
                        Go to Dashboard
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900 animate-pulse">
                    <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <CardTitle className="text-2xl">Application Under Review</CardTitle>
                <CardDescription>
                    Your company registration is being reviewed by our team
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 p-4">
                    <h3 className="font-semibold mb-2">What happens next?</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Our team will review your application and documents</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>This process typically takes 1-3 business days</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>You&apos;ll receive an email once your application is approved</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>After approval, you&apos;ll have full access to your company dashboard</span>
                        </li>
                    </ul>
                </div>

                <div className="text-center text-xs text-muted-foreground">
                    <p>This page automatically refreshes every 30 seconds</p>
                </div>

                <div className="flex flex-col gap-2">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        className="w-full"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Check Status Now
                    </Button>
                    <Button variant="ghost" onClick={() => router.push('/onboarding/step-6')}>
                        View Application
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}