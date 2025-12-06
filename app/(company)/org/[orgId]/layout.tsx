import AppSidebar from '@/components/dashboard/app-sidebar';
import { companyNavItems } from '@/components/dashboard/nav-config'; // ✅ Changed import
import { requireCompanyAccess } from '@/lib/access-control/permissions';
import { notFound } from 'next/navigation';

interface OrgLayoutProps {
    children: React.ReactNode;
    params: Promise<{ orgId: string }>;
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
    const { orgId } = await params;
    const userContext = await requireCompanyAccess(orgId);

    if (!userContext.companyId || userContext.companyId !== orgId) {
        notFound();
    }

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
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}