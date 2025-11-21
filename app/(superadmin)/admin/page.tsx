import React from 'react';
import { getDashboardStats } from '@/lib/services/actions/company.actions';
import { getCurrentUserContext } from '@/lib/access-control/permissions';
import { StatsCards } from '@/features/admin/stats-cards';
import { RecentApplications } from '@/features/admin/recent-applications';

async function AdminDashboardPage() {
    const userContext = await getCurrentUserContext();
    const stats = await getDashboardStats();

    return (
        <main className="flex-1 p-6 md:p-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, {userContext?.name}. Here&apos;s what&apos;s happening with your platform.
                    </p>
                </div>

                <StatsCards stats={stats} />
                
                <RecentApplications applications={stats.recentApplications} />
            </div>
        </main>
    );
}

export default AdminDashboardPage;