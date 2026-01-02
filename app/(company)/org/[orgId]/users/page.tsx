import { Suspense } from "react";
import { requireAuth } from "@/lib/access-control/permissions";
import { Skeleton } from "@/components/ui/skeleton";
import { listTeamMembers } from "@/lib/services/actions/team-members.actions";
import { TeamMembersContent } from "@/features/company/team-members-content";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface UsersPageProps {
    params: Promise<{ orgId: string }>;
}

function LoadingSkeleton() {
    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="space-y-2">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-5 w-96" />
            </div>

            {/* Stats cards */}
            <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

async function UsersContent({ orgId }: { orgId: string }) {
    let userContext;
    let result;

    try {
        userContext = await requireAuth();
    } catch (error) {
        return (
            <div className="flex-1 space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
                    <p className="text-muted-foreground">
                        Manage your team members and their roles
                    </p>
                </div>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="text-center space-y-2">
                            <p className="text-lg font-medium">Authentication Required</p>
                            <p className="text-sm text-muted-foreground">
                                Please sign in to view this page.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    try {
        result = await listTeamMembers({ companyId: orgId });

    } catch (error) {
        console.error("Error fetching team members:", error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

        return (
            <div className="flex-1 space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
                    <p className="text-muted-foreground">
                        Manage your team members and their roles
                    </p>
                </div>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-destructive"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-lg font-medium">Access Denied</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {errorMessage}
                                </p>
                            </div>
                            {errorMessage.includes("permission") && (
                                <p className="text-xs text-muted-foreground">
                                    Please contact your organization administrator to grant you access.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (result?.serverError || !result?.data) {
        console.error("Server error or missing data:", result?.serverError);
        return (
            <div className="flex-1 space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
                    <p className="text-muted-foreground">
                        Manage your team members and their roles
                    </p>
                </div>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="text-center space-y-2">
                            <p className="text-lg font-medium">Unable to Load Team Members</p>
                            <p className="text-sm text-muted-foreground">
                                {result?.serverError || "There was an error loading the team members. Please try again."}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { activeMembers = [], pendingMembers = [], stats } = result.data.data || { activeMembers: [], pendingMembers: [], stats: { owners: 0, admins: 0, editors: 0, viewers: 0 } };

    return (
        <div className="flex-1 space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
                <p className="text-muted-foreground">
                    Manage your team members and their roles
                </p>
            </div>

            <TeamMembersContent
                orgId={orgId}
                activeMembers={activeMembers}
                pendingMembers={pendingMembers}
                stats={stats}
                currentUserId={userContext.userId}
                currentUserRole={userContext.role}
            />
        </div>
    );
}

export default async function UsersPage({ params }: UsersPageProps) {
    const { orgId } = await params;

    return (
        <Suspense fallback={<LoadingSkeleton />}>
            <UsersContent orgId={orgId} />
        </Suspense>
    );
}

// Enable partial prerendering
export const experimental_ppr = true;
