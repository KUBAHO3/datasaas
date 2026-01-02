import AppSidebar from '@/components/dashboard/app-sidebar';
import { companyNavItems } from '@/components/dashboard/nav-config';
import { requireCompany } from '@/lib/access-control/permissions';

export default async function CompanyDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const userContext = await requireCompany();

    // Get company ID from userContext
    const orgId = userContext.companyId || '';

    return (
        <div className="flex h-screen overflow-hidden">
            <AppSidebar
                navItems={companyNavItems(orgId)}
                user={{
                    name: userContext.name,
                    email: userContext.email,
                    role: userContext.role || "Member",
                }}
            />
            <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}