import { CompanyBasicInfoForm } from "@/features/onboarding/company-basic-form";
import { requireAuth } from "@/lib/access-control/permissions";
import { getOnboardingProgress } from "@/lib/services/actions/onboarding.actions";
import { redirect } from "next/navigation";

export default async function Step2Page() {
    const userContext = await requireAuth();

    const company = await getOnboardingProgress();

    if (company.currentStep > 2 && company.currentStep < 6 && company.status === "draft") {
        redirect(`/onboarding/step-${company.currentStep}`);
    }

    if (company.status === "pending" || company.status === "rejected") {
        redirect("/onboarding/pending-approval");
    }

    if (company.status === "active" && userContext.companyId) {
        redirect(`/org/${userContext.companyId}`);
    }

    const initialData = {
        companyName: company.companyName || "",
        industry: company.industry || "",
        size: company.size || "",
        website: company.website || "",
        phone: company.phone || "",
        description: company.description || "",
    };

    return <CompanyBasicInfoForm initialData={initialData} />;
}