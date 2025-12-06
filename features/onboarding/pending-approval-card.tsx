"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, XCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { CompanyStatus } from "@/lib/types/company-types";

interface PendingApprovalCardProps {
    status: CompanyStatus;
    rejectionReason?: string;
}

export function PendingApprovalCard({ status, rejectionReason }: PendingApprovalCardProps) {
    const isPending = status === "pending";
    const isRejected = status === "rejected";

    return (
        <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                    {isPending && (
                        <div className="rounded-full bg-yellow-100 dark:bg-yellow-900 p-3 inline-block">
                            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    )}
                    {isRejected && (
                        <div className="rounded-full bg-red-100 dark:bg-red-900 p-3 inline-block">
                            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                    )}
                </div>

                <CardTitle className="text-2xl">
                    {isPending && "Application Under Review"}
                    {isRejected && "Application Requires Attention"}
                </CardTitle>

                <CardDescription>
                    {isPending && "Your company registration is being reviewed by our team"}
                    {isRejected && "Your application needs to be updated"}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {isPending && (
                    <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                            We&apos;ve received your application and our team is reviewing it.
                            You&apos;ll receive an email notification once your application has been processed.
                            This typically takes 1-2 business days.
                        </AlertDescription>
                    </Alert>
                )}

                {isRejected && rejectionReason && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                            <p className="font-semibold mb-2">Reason for rejection:</p>
                            <p>{rejectionReason}</p>
                        </AlertDescription>
                    </Alert>
                )}

                {isRejected && (
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Please review the feedback above and update your application accordingly.
                        </p>
                        <Button asChild className="w-full">
                            <Link href="/onboarding/step-2">
                                Update Application
                            </Link>
                        </Button>
                    </div>
                )}

                {isPending && (
                    <div className="text-center pt-4">
                        <p className="text-sm text-muted-foreground">
                            Need help? Contact our support team
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}