import { CompanyBasicInfoForm } from "@/features/onboarding/company-basic-form";
import { requireAuth } from "@/lib/access-control/permissions";
import { getOnboardingProgress } from "@/lib/services/actions/onboarding.actions";
import { redirect } from "next/navigation";

export default async function Step2Page() {
    await requireAuth();

    const progress = await getOnboardingProgress();
    
    if (progress.currentStep > 2 && progress.currentStep < 6) {
        redirect(`/onboarding/step-${progress.currentStep}`);
    }

    return <CompanyBasicInfoForm initialData={progress.companyBasicInfo} />;
}