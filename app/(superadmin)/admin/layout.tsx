import AppSidebar from '@/components/dashboard/app-sidebar';
import { adminNavItems } from '@/components/dashboard/nav-items';
import { requireSuperAdmin } from '@/lib/access-control/permissions';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const userContext = await requireSuperAdmin();

    return (
        <div className="flex h-screen overflow-hidden">
            <AppSidebar
                navItems={adminNavItems}
                user={{
                    name: userContext.name,
                    email: userContext.email,
                    role: "Super Admin",
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