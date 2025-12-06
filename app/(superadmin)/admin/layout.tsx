import { requireSuperAdmin } from '@/lib/access-control/permissions';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { SuperAdminSidebar } from '@/features/dashboard/super-admin-sidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const userContext = await requireSuperAdmin();

    return (
        <SidebarProvider>
            <SuperAdminSidebar
                user={{
                    name: userContext.name,
                    email: userContext.email,
                }}
            />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage className="flex items-center gap-2">
                                    Admin Panel
                                    <Badge variant="secondary" className="ml-1">
                                        Super Admin
                                    </Badge>
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}