import { requireAuth } from "@/lib/access-control/permissions";
import { getOnboardingProgress } from "@/lib/services/actions/onboarding.actions";
import { redirect } from "next/navigation";
import { PendingApprovalCard } from "@/features/onboarding/pending-approval-card";

export default async function PendingApprovalPage() {
    await requireAuth();
    const progress = await getOnboardingProgress();

    if (progress.status !== 'submitted' && progress.status !== 'rejected') {
        redirect('/onboarding');
    }

    if (progress.status === 'approved' as string) {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
            <PendingApprovalCard
                status={progress.status}
                rejectionReason={progress.rejectionReason}
            />
        </div>
    );
}