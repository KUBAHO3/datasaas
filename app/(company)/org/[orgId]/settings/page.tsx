import { requireCompanyAccess } from '@/lib/access-control/permissions';
import { CompanyAdminModel } from '@/lib/services/models/company.model';
import { redirect } from 'next/navigation';
import { CompanyProfileForm } from '@/features/company/company-profile-form';
import { ROLE_ARRAYS } from '@/lib/constants/rbac-roles';
import { Card, CardContent } from '@/components/ui/card';

interface SettingsPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { orgId } = await params;
  const userContext = await requireCompanyAccess(orgId);

  // Check if user has owner or admin permission
  const hasPermission = userContext.role
    ? ROLE_ARRAYS.OWNER_AND_ADMIN.includes(userContext.role as any)
    : false;

  // Deny access for non-admin users (show error message instead of silent redirect)
  if (!hasPermission && !userContext.isSuperAdmin) {
    return (
      <div className="p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your company profile and information
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
                  You need Owner or Admin permissions to access company settings.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your current role: {userContext.role || 'No role assigned'}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Please contact your company owner or administrator if you need access to this feature.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const companyModel = new CompanyAdminModel();
  const company = await companyModel.findById(orgId);

  if (!company) {
    redirect(`/org/${orgId}`);
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your company profile and information
        </p>
      </div>

      <CompanyProfileForm company={company} />
    </div>
  );
}
