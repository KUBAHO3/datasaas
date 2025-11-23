"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface PendingApprovalCardProps {
    status: 'submitted' | 'approved' | 'rejected';
    rejectionReason?: string;
}

export function PendingApprovalCard({ status, rejectionReason }: PendingApprovalCardProps) {
    const router = useRouter();

    if (status === 'rejected') {
        return (
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                        <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle className="text-2xl">Application Rejected</CardTitle>
                    <CardDescription>
                        Unfortunately, your company application was not approved
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {rejectionReason && (
                        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 p-4">
                            <p className="text-sm font-medium mb-1">Reason:</p>
                            <p className="text-sm text-muted-foreground">{rejectionReason}</p>
                        </div>
                    )}
                    <div className="flex flex-col gap-2">
                        <Button onClick={() => router.push('/onboarding/step-2')}>
                            Update Application
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/auth/sign-in')}>
                            Sign Out
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
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

                <div className="flex flex-col gap-2">
                    <Button variant="outline" onClick={() => router.push('/onboarding/step-6')}>
                        View Application
                    </Button>
                    <Button variant="ghost" onClick={() => router.push('/auth/sign-in')}>
                        Sign Out
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}