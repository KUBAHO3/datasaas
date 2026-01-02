import { redirect } from 'next/navigation';
import { requireCompanyAccess } from '@/lib/access-control/permissions';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { CompanyAdminModel } from '@/lib/services/models/company.model';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { OrgSidebar } from '@/features/dashboard/org-sidebar';
import { PendingApprovalDashboard } from '@/features/dashboard/pending-approval-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface OrgLayoutProps {
    children: React.ReactNode;
    params: Promise<{ orgId: string }>;
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
    const { orgId } = await params;
    const userContext = await requireCompanyAccess(orgId);

    if (!userContext.companyId || userContext.companyId !== orgId) {
        if (userContext.companyId) {
            redirect(`/org/${userContext.companyId}`);
        }
        redirect('/onboarding');
    }

    const companyModel = new CompanyAdminModel();
    const company = await companyModel.findById(orgId);

    if (!company) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-muted/20">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-destructive mb-2">
                            <AlertCircle className="h-5 w-5" />
                            <CardTitle>Organization Not Found</CardTitle>
                        </div>
                        <CardDescription>
                            The organization you're trying to access doesn't exist or has been deleted.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Organization ID: <code className="bg-muted px-1 py-0.5 rounded">{orgId}</code>
                        </p>
                        {userContext.companyId && (
                            <div className="mt-4">
                                <a
                                    href={`/org/${userContext.companyId}`}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Go to your organization →
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
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
            <SidebarInset className="overflow-x-hidden">
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