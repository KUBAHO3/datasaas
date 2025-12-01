import AppSidebar from '@/components/dashboard/app-sidebar';
import { companyNavItems } from '@/components/dashboard/nav-items';
import { requireCompany } from '@/lib/access-control/permissions';

export default async function CompanyDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const userContext = await requireCompany();

    return (
        <div className="flex h-screen overflow-hidden">
            <AppSidebar
                navItems={companyNavItems}
                user={{
                    name: userContext.name,
                    email: userContext.email,
                    role: userContext.role || "Member",
                }}
            />
            <div className="flex flex-1 flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}