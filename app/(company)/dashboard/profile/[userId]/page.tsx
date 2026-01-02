import { requireAuth } from "@/lib/access-control/permissions";
import { getUserProfileById } from "./actions";
import { Suspense } from "react";
import { UserProfileView } from "@/components/user/user-profile-view";
import { notFound, redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ProfilePageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const userContext = await requireAuth();
  const { userId } = await params;

  // If viewing own profile, redirect to /dashboard/profile
  if (userId === userContext.userId) {
    redirect("/dashboard/profile");
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
        <p className="text-muted-foreground mt-2">
          View user information and manage permissions
        </p>
      </div>

      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent userId={userId} userContext={userContext} />
      </Suspense>
    </div>
  );
}

async function ProfileContent({
  userId,
  userContext,
}: {
  userId: string;
  userContext: any;
}) {
  const userData = await getUserProfileById(userId, userContext.userId);

  if (!userData) {
    notFound();
  }

  // Verify same company (unless superadmin)
  if (!userContext.isSuperAdmin && userData.companyId !== userContext.companyId) {
    notFound();
  }

  return (
    <UserProfileView
      user={userData}
      viewerUserId={userContext.userId}
      viewerRole={userContext.role}
      isOwnProfile={false}
    />
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Card Skeleton */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content Cards Skeleton */}
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
