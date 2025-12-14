import { notFound } from 'next/navigation';
import { requireCompanyAccess } from '@/lib/access-control/permissions';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { CompanyAdminModel } from '@/lib/services/models/company.model';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { OrgSidebar } from '@/features/dashboard/org-sidebar';
import { PendingApprovalDashboard } from '@/features/dashboard/pending-approval-dashboard';

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

    // Get company details for sidebar
    const companyModel = new CompanyAdminModel();
    const company = await companyModel.findById(orgId);

    if (!company) {
        notFound();
    }

    const isOwner = company.createdBy === userContext.userId;

    return (
        <SidebarProvider>
            <OrgSidebar
                orgId={orgId}
                user={{
                    name: userContext.name,
                    email: userContext.email,
                    role: userContext.role || "Member",
                }}
                companyName={company.companyName || "Your Organization"}
            />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage>{company.companyName}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                {company.status !== "active" ? <PendingApprovalDashboard company={company} isOwner={isOwner} /> : children}
            </SidebarInset>
        </SidebarProvider>
    );
}