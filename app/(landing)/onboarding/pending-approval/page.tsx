import { requireAuth } from "@/lib/access-control/permissions";
import { getOnboardingProgress } from "@/lib/services/actions/onboarding.actions";
import { redirect } from "next/navigation";
import { PendingApprovalCard } from "@/features/onboarding/pending-approval-card";

export default async function PendingApprovalPage() {
    const userContext = await requireAuth();
    const company = await getOnboardingProgress();

    if (company.status !== "pending" && company.status !== "rejected") {
        if (company.status === "draft") {
            redirect("/onboarding");
        }
        
        if (company.status === "active" && userContext.companyId) {
            redirect(`/org/${userContext.companyId}`);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
            <PendingApprovalCard
                status={company.status}
                rejectionReason={company.rejectionReason}
            />
        </div>
    );
}