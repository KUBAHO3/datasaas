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
    const userContext = await requireAuth();

    // Check if user has access to this org (owner, admin, editor, or viewer)
    // For now, we'll fetch the members which will validate access
    const result = await listTeamMembers({ companyId: orgId });

    // Handle errors gracefully instead of 404
    if (!result?.data) {
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

    const { activeMembers = [], pendingMembers = [], stats } = result.data.data || { stats: { owners: 0, admins: 0, editors: 0, viewers: 0 } };

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
