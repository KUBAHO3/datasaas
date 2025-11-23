import { CompanyBrandingForm } from "@/features/onboarding/company-branding-form";
import { requireAuth } from "@/lib/access-control/permissions";
import { getOnboardingProgress } from "@/lib/services/actions/onboarding.actions";

export default async function Step4Page() {
    await requireAuth();

    const progress = await getOnboardingProgress();
    return <CompanyBrandingForm initialData={progress.companyBranding} />;
}