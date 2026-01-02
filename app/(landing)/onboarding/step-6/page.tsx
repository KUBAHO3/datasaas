import { ReviewSubmission } from "@/features/onboarding/review-submission";
import { requireAuth } from "@/lib/access-control/permissions";
import { getOnboardingProgress } from "@/lib/services/actions/onboarding.actions";
import { OnboardingProgressWithArrays } from "@/lib/types/onboarding-types";

export default async function Step6Page() {
    await requireAuth();

    const company = await getOnboardingProgress();

    // Convert Organization to OnboardingProgressWithArrays
    const progress: OnboardingProgressWithArrays = {
        ...company,
        userId: company.createdBy,
        currentStep: company.currentStep ?? 1,
        completedSteps: company.completedSteps ?? [],
        status: company.status === "draft" ? "in_progress" :
                company.status === "pending" ? "submitted" :
                company.status === "active" ? "approved" : "rejected",
        certificationsFileIds: company.certificationsFileIds ?? [],
    };

    return <ReviewSubmission progress={progress} />;
}