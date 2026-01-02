import { getCurrentUserContext } from "@/lib/access-control/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DebugPage() {
  const userContext = await getCurrentUserContext();

  if (!userContext) {
    return <div>Not logged in</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Debug User Info</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">User ID</p>
              <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                {userContext.userId}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                {userContext.email}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                {userContext.name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Company ID</p>
              <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                {userContext.companyId || "NOT SET ❌"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                {userContext.role || "NOT SET ❌"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Is Super Admin</p>
              <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                {userContext.isSuperAdmin ? "Yes" : "No"}
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm font-medium mb-2">Fix Command:</p>
            <code className="text-xs bg-white p-2 rounded block">
              npx tsx scripts/fix-user-role.ts {userContext.userId} 692366110004551314 owner
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
