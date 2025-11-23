import { CompanyAddressForm } from "@/features/onboarding/company-address-form";
import { requireAuth } from "@/lib/access-control/permissions";
import { getOnboardingProgress } from "@/lib/services/actions/onboarding.actions";

export default async function Step3Page() {
    await requireAuth();

    const progress = await getOnboardingProgress();
    return <CompanyAddressForm initialData={progress.companyAddress} />;
}