import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/access-control/permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { QuickActions } from "@/features/dashboard/quick-actions";
import { DashboardStatsCards } from "@/features/dashboard/dashboard-stats";
import { PendingApprovalDashboard } from "@/features/dashboard/pending-approval-dashboard";
import { getCompanyDashboard } from "@/lib/services/actions/company.actions";

interface DashboardPageProps {
    params: Promise<{ orgId: string }>;
}

function StatsLoadingSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-3 w-32" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function QuickActionsLoadingSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-12 w-12 rounded-full mb-3" />
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-3 w-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

async function DashboardContent({ orgId }: { orgId: string }) {
    const userContext = await requireAuth();
    const dashboardData = await getCompanyDashboard(orgId, userContext.userId);

    if (!dashboardData) {
        notFound();
    }

    const { company, stats, isMember, userRole } = dashboardData;
    const isOwner = company.createdBy === userContext.userId;

    if (company.status !== "active") {
        return <PendingApprovalDashboard company={company} isOwner={isOwner} />;
    }

    if (!isMember && !userContext.isSuperAdmin) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
                <Card className="w-full max-w-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Access Denied</CardTitle>
                        <CardDescription>
                            You are not a member of this organization
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Please contact your organization administrator to request access.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back to {company.companyName}
                </p>
            </div>

            {/* Stats Section with Suspense */}
            <Suspense fallback={<StatsLoadingSkeleton />}>
                <DashboardStatsCards stats={stats} />
            </Suspense>

            {/* Quick Actions Section with Suspense */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold">Quick Actions</h2>
                    <p className="text-sm text-muted-foreground">
                        Get started with common tasks
                    </p>
                </div>
                <Suspense fallback={<QuickActionsLoadingSkeleton />}>
                    <QuickActions orgId={orgId} userRole={userRole} />
                </Suspense>
            </div>

            {/* Additional sections can be added here */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest updates and changes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            No recent activity to display
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Getting Started</CardTitle>
                        <CardDescription>Quick tips to maximize your experience</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-sm">
                            <p className="font-medium mb-1">1. Create your first form</p>
                            <p className="text-muted-foreground text-xs">
                                Build custom data collection forms with our drag-and-drop builder
                            </p>
                        </div>
                        <div className="text-sm">
                            <p className="font-medium mb-1">2. Invite team members</p>
                            <p className="text-muted-foreground text-xs">
                                Collaborate with your team by inviting members with different roles
                            </p>
                        </div>
                        <div className="text-sm">
                            <p className="font-medium mb-1">3. Import existing data</p>
                            <p className="text-muted-foreground text-xs">
                                Upload CSV or Excel files to import your existing datasets
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default async function DashboardPage({ params }: DashboardPageProps) {
    const { orgId } = await params;

    return (
        <Suspense
            fallback={
                <div className="flex-1 space-y-6 p-6">
                    <div className="space-y-2">
                        <Skeleton className="h-9 w-48" />
                        <Skeleton className="h-5 w-64" />
                    </div>
                    <StatsLoadingSkeleton />
                    <QuickActionsLoadingSkeleton />
                </div>
            }
        >
            <DashboardContent orgId={orgId} />
        </Suspense>
    );
}

// Enable partial prerendering
export const experimental_ppr = true;