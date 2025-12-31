import { requireAuth } from '@/lib/access-control/permissions';
import { UserProfileForm } from '@/features/user/user-profile-form';
import { getUserProfile } from './actions';
import { Suspense } from 'react';

export default async function ProfilePage() {
  const userContext = await requireAuth();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal information and settings
        </p>
      </div>

      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent userId={userContext.userId} userContext={userContext} />
      </Suspense>
    </div>
  );
}

async function ProfileContent({
  userId,
  userContext
}: {
  userId: string;
  userContext: any;
}) {
  const userData = await getUserProfile(userId);

  return <UserProfileForm user={userContext} userData={userData} />;
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-32 bg-muted animate-pulse rounded-lg" />
      <div className="h-20 bg-muted animate-pulse rounded-lg" />
      <div className="h-20 bg-muted animate-pulse rounded-lg" />
    </div>
  );
}
