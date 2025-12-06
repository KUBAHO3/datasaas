import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, XCircle, CheckCircle2, ShieldAlert, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Company, CompanyStatus } from "@/lib/types/company-types";

interface PendingApprovalDashboardProps {
    company: Company;
    isOwner: boolean;
}

export function PendingApprovalDashboard({ company, isOwner }: PendingApprovalDashboardProps) {
    const isPending = company.status === "pending";
    const isRejected = company.status === "rejected";
    const isDraft = company.status === "draft";
    const isSuspended = company.status === "suspended";

    if (!isOwner) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
                <Card className="w-full max-w-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4">
                            <div className="rounded-full bg-red-100 dark:bg-red-900 p-3 inline-block">
                                <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                        </div>

                        <CardTitle className="text-2xl">Access Denied</CardTitle>
                        <CardDescription>
                            You don't have permission to access this organization
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                This organization is not yet approved. Only the organization owner can view the pending status.
                            </AlertDescription>
                        </Alert>

                        <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Please contact your organization administrator for access.
                            </p>
                            <Button asChild className="w-full">
                                <Link href="/">Return to Home</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
            <Card className="w-full max-w-2xl">
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
                        {isDraft && (
                            <div className="rounded-full bg-gray-100 dark:bg-gray-900 p-3 inline-block">
                                <AlertTriangle className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                            </div>
                        )}
                        {isSuspended && (
                            <div className="rounded-full bg-orange-100 dark:bg-orange-900 p-3 inline-block">
                                <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                            </div>
                        )}
                    </div>

                    <CardTitle className="text-2xl">
                        {isPending && "Application Under Review"}
                        {isRejected && "Application Requires Attention"}
                        {isDraft && "Complete Your Registration"}
                        {isSuspended && "Organization Suspended"}
                    </CardTitle>

                    <CardDescription>
                        {isPending && "Your organization registration is being reviewed by our team"}
                        {isRejected && "Your application needs to be updated and resubmitted"}
                        {isDraft && "Please complete your organization registration process"}
                        {isSuspended && "Your organization access has been temporarily suspended"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Status Alert */}
                    {isPending && (
                        <Alert>
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                                We've received your application and our team is reviewing it.
                                You'll receive an email notification once your application has been processed.
                                This typically takes 1-2 business days.
                            </AlertDescription>
                        </Alert>
                    )}

                    {isRejected && company.rejectionReason && (
                        <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Rejection Reason:</strong>
                                <p className="mt-2">{company.rejectionReason}</p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {isSuspended && company.suspensionReason && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Suspension Reason:</strong>
                                <p className="mt-2">{company.suspensionReason}</p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Company Information */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold">Organization Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Company Name</p>
                                <p className="font-medium">{company.companyName || "Not provided"}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Industry</p>
                                <p className="font-medium">{company.industry || "Not provided"}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Submitted At</p>
                                <p className="font-medium">
                                    {company.submittedAt
                                        ? new Date(company.submittedAt).toLocaleDateString()
                                        : "Not submitted"}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Current Status</p>
                                <p className="font-medium capitalize">{company.status}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        {isRejected && (
                            <Button asChild className="flex-1">
                                <Link href="/onboarding">Update Application</Link>
                            </Button>
                        )}
                        {isDraft && (
                            <Button asChild className="flex-1">
                                <Link href="/onboarding">Continue Registration</Link>
                            </Button>
                        )}
                        <Button asChild variant="outline" className={isRejected || isDraft ? "flex-1" : "w-full"}>
                            <Link href="/">Return to Home</Link>
                        </Button>
                    </div>

                    {/* Help Text */}
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            Need assistance? Contact our support team at{" "}
                            <a href="mailto:support@datasaas.com" className="text-primary hover:underline">
                                support@datasaas.com
                            </a>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}