import { requireAuth } from '@/lib/access-control/permissions';
import { UserProfileForm } from '@/features/user/user-profile-form';
import { getUserProfile } from './actions';
import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserProfileView } from '@/components/user/user-profile-view';
import { Card, CardContent } from '@/components/ui/card';

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

  console.log("uuuuuu: ", userData)

  if (!userData) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Unable to load profile data. Please try again later.
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="edit" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="edit">Edit Profile</TabsTrigger>
        <TabsTrigger value="view">View Profile</TabsTrigger>
      </TabsList>

      <TabsContent value="edit" className="mt-6">
        <UserProfileForm user={userContext} userData={userData} />
      </TabsContent>

      <TabsContent value="view" className="mt-6">
        <UserProfileView
          user={userData}
          viewerUserId={userContext.userId}
          viewerRole={userContext.role}
          isOwnProfile={true}
        />
      </TabsContent>
    </Tabs>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-full max-w-md bg-muted animate-pulse rounded-lg" />
      <div className="h-32 bg-muted animate-pulse rounded-lg" />
      <div className="h-20 bg-muted animate-pulse rounded-lg" />
      <div className="h-20 bg-muted animate-pulse rounded-lg" />
    </div>
  );
}
