import { Suspense } from "react";
import { redirect } from "next/navigation";
import { SessionAccountService } from "@/lib/services/core/base-account";
import { getUserCompanyWithStatus } from "@/lib/access-control/company-access";
import { UserDataAdminModel } from "@/lib/services/models/users.model";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Mail, Shield, Ban } from "lucide-react";
import Link from "next/link";

async function SuspendedContent() {
  const sessionAccountService = new SessionAccountService();
  const user = await sessionAccountService.get();

  if (!user) {
    redirect("/login");
  }

  const isSuperAdmin = user.labels?.includes("superadmin") ?? false;

  // Super admins shouldn't see this page
  if (isSuperAdmin) {
    redirect("/admin");
  }

  // Check if user is suspended
  const userDataModel = new UserDataAdminModel();
  const userData = await userDataModel.findByUserId(user.$id);
  const isUserSuspended = userData?.suspended ?? false;

  // Check if company is suspended
  const company = await getUserCompanyWithStatus(user.$id);
  const isCompanySuspended = company?.status === "suspended";

  // If neither user nor company is suspended, redirect to dashboard
  if (!isUserSuspended && !isCompanySuspended) {
    redirect("/org");
  }

  // Determine which suspension type to show
  const suspensionType = isUserSuspended ? "user" : "company";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
            {suspensionType === "user" ? (
              <Ban className="w-8 h-8 text-orange-600 dark:text-orange-500" />
            ) : (
              <Shield className="w-8 h-8 text-orange-600 dark:text-orange-500" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {suspensionType === "user" ? "Account Suspended" : "Company Suspended"}
          </CardTitle>
          <CardDescription className="text-base">
            {suspensionType === "user"
              ? "Your user account has been temporarily suspended"
              : "Your company account has been temporarily suspended"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert variant="destructive" className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <AlertDescription className="text-orange-800 dark:text-orange-400">
              {suspensionType === "user" ? (
                <>
                  Your account has been suspended by an organization administrator.
                  Access to all features has been temporarily disabled.
                </>
              ) : (
                <>
                  <strong className="font-semibold">{company?.companyName}</strong> has been suspended.
                  Access to all features and data has been temporarily disabled.
                </>
              )}
            </AlertDescription>
          </Alert>

          <div className="bg-muted rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">What does this mean?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {suspensionType === "user" ? (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Your access to the organization has been temporarily disabled</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>You cannot access any organization data or resources</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Your account can be restored by an organization administrator</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Contact your organization admin if you believe this is an error</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Your company account access has been temporarily disabled</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>All team members are unable to access the platform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Your data is safe and will be restored when your account is reactivated</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>No data will be lost during the suspension period</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-6 space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Need Help?
            </h3>
            <p className="text-sm text-muted-foreground">
              If you believe this is a mistake or need assistance, please contact our support team.
              We'll help you understand the reason for suspension and guide you through the reactivation process.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button asChild variant="default">
                <a href="mailto:support@datasaas.com">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/logout">
                  Sign Out
                </Link>
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Once your account is reactivated, you and your team will regain full access
              to all features and data without any additional setup required.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuspendedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <SuspendedContent />
    </Suspense>
  );
}
