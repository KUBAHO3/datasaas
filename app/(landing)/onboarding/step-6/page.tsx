import { ReviewSubmission } from "@/features/onboarding/review-submission";
import { requireAuth } from "@/lib/access-control/permissions";
import { getOnboardingProgress } from "@/lib/services/actions/onboarding.actions";

export default async function Step6Page() {
    await requireAuth();

    const progress = await getOnboardingProgress();
    return <ReviewSubmission progress={progress} />;
}