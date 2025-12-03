import { CompanyBasicInfoForm } from "@/features/onboarding/company-basic-form";
import { requireAuth } from "@/lib/access-control/permissions";
import { getOnboardingProgress } from "@/lib/services/actions/onboarding.actions";
import { redirect } from "next/navigation";

export default async function Step2Page() {
    await requireAuth();

    const progress = await getOnboardingProgress();

    if (progress.currentStep > 2 && progress.currentStep < 6 && progress.status === "in_progress") {
        redirect(`/onboarding/step-${progress.currentStep}`);
    }

    if (progress.status === "submitted" || progress.status === "rejected") {
        redirect("/onboarding/pending-approval");
    }

    if (progress.status === "approved") {
        redirect("/dashboard");
    }

    const initialData = {
        companyName: progress.companyName || "",
        industry: progress.industry || "",
        size: progress.size || "",
        website: progress.website || "",
        phone: progress.phone || "",
        description: progress.description || "",
    };

    return <CompanyBasicInfoForm initialData={initialData} />;
}