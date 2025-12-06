import { Suspense } from "react";
import { requireSuperAdmin } from "@/lib/access-control/permissions";
import { CompanyAdminModel } from "@/lib/services/models/company.model";
import { UserDataAdminModel } from "@/lib/services/models/users.model";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    color,
    bgColor,
}: {
    title: string;
    value: number;
    description: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className={`rounded-full p-2 ${bgColor}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

function DashboardLoadingSkeleton() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            <div className="space-y-2">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-5 w-64" />
            </div>
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
        </div>
    );
}

async function DashboardContent() {
    const userContext = await requireSuperAdmin();
    const companyModel = new CompanyAdminModel();
    const userDataModel = new UserDataAdminModel();

    const [totalCompanies, activeCompanies, pendingCompanies, totalUsers] = await Promise.all([
        companyModel.count(),
        companyModel.count({
            where: [{ field: "status", operator: "equals", value: "active" }],
        }),
        companyModel.count({
            where: [{ field: "status", operator: "equals", value: "pending" }],
        }),
        userDataModel.count(),
    ]);

    const recentApplications = await companyModel.getPendingApplications(5);

    const statsCards = [
        {
            title: "Total Companies",
            value: totalCompanies,
            description: "All registered companies",
            icon: Building2,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950",
        },
        {
            title: "Active Companies",
            value: activeCompanies,
            description: "Currently operational",
            icon: CheckCircle2,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950",
        },
        {
            title: "Pending Approvals",
            value: pendingCompanies,
            description: "Awaiting review",
            icon: Clock,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-950",
        },
        {
            title: "Total Users",
            value: totalUsers,
            description: "Across all companies",
            icon: Users,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950",
        },
    ];

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {userContext.name}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat) => (
                    <StatsCard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common administrative tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/admin/companies">
                                <Building2 className="mr-2 h-4 w-4" />
                                Manage Companies
                            </Link>
                        </Button>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/admin/companies?status=pending">
                                <Clock className="mr-2 h-4 w-4" />
                                Review Pending ({pendingCompanies})
                            </Link>
                        </Button>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/admin/users">
                                <Users className="mr-2 h-4 w-4" />
                                Manage Users
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Recent Applications */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Applications</CardTitle>
                        <CardDescription>
                            Latest company registration requests
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentApplications.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No pending applications
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {recentApplications.map((company) => (
                                    <Link
                                        key={company.$id}
                                        href={`/admin/companies/${company.$id}`}
                                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950">
                                                <Building2 className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {company.companyName || "Unnamed Company"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {company.industry || "No industry"}
                                                </p>
                                            </div>
                                        </div>
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    </Link>
                                ))}
                                {recentApplications.length > 0 && (
                                    <Button asChild variant="ghost" className="w-full">
                                        <Link href="/admin/companies?status=pending">
                                            View All Pending
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* System Status */}
            <Card>
                <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>Platform health and metrics</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">All Systems Operational</p>
                                <p className="text-xs text-muted-foreground">Last checked: Just now</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{totalUsers} Active Users</p>
                                <p className="text-xs text-muted-foreground">Across all companies</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950">
                                <Building2 className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{activeCompanies} Active</p>
                                <p className="text-xs text-muted-foreground">Companies operating</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default async function AdminDashboard() {
    return (
        <Suspense fallback={<DashboardLoadingSkeleton />}>
            <DashboardContent />
        </Suspense>
    );
}

export const experimental_ppr = true;