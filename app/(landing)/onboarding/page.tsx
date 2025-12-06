import { requireAuth } from "@/lib/access-control/permissions";
import { getOnboardingProgress } from "@/lib/services/actions/onboarding.actions";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
    await requireAuth();

    const progress = await getOnboardingProgress();

    if (progress.status === "pending" || progress.status === "rejected") {
        redirect("/onboarding/pending-approval");
    }

    if (progress.status === "active") {
        redirect("/dashboard");
    }

    const currentStep = progress.currentStep;

    switch (currentStep) {
        case 1:
        case 2:
            redirect("/onboarding/step-2");
            break;

        case 3:
            redirect("/onboarding/step-3");
            break;

        case 4:
            redirect("/onboarding/step-4");
            break;

        case 5:
            redirect("/onboarding/step-5");
            break;

        case 6:
            redirect("/onboarding/step-6");
            break;

        default:
            redirect("/onboarding/step-2");
    }
}