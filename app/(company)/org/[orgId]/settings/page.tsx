import { requireCompanyAccess } from '@/lib/access-control/permissions';
import { CompanyAdminModel } from '@/lib/services/models/company.model';
import { redirect } from 'next/navigation';
import { CompanyProfileForm } from '@/features/company/company-profile-form';

interface SettingsPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { orgId } = await params;
  const userContext = await requireCompanyAccess(orgId);

  //Check if user has permission (owner or admin)
  const hasPermission = userContext.role === 'owner' || userContext.role === 'admin';

  if (!hasPermission && !userContext.isSuperAdmin) {
    redirect(`/org/${orgId}`);
  }

  // Get company details
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
