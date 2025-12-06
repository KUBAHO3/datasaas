import React from 'react';
import { requireCompanyAccess } from '@/lib/access-control/permissions';
import { notFound } from 'next/navigation';

interface OrgDashboardPageProps {
    params: Promise<{ orgId: string }>;
}

async function OrgDashboardPage({ params }: OrgDashboardPageProps) {
    const { orgId } = await params;
    const userContext = await requireCompanyAccess(orgId);

    if (!userContext.companyId || userContext.companyId !== orgId) {
        notFound();
    }

    return (
        <main className="flex-1 p-6 md:p-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, {userContext.name}. Here&apos;s your organization overview.
                    </p>
                </div>

                {/* Add your dashboard widgets here */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Stats cards will go here */}
                </div>
            </div>
        </main>
    );
}

export default OrgDashboardPage;