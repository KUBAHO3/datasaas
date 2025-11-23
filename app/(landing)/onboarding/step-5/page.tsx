import { DocumentUploadForm } from "@/features/onboarding/document-upload-form";
import { requireAuth } from "@/lib/access-control/permissions";
import { getOnboardingProgress } from "@/lib/services/actions/onboarding.actions";

export default async function Step5Page() {
    await requireAuth();

    const progress = await getOnboardingProgress();
    return <DocumentUploadForm initialData={progress.documents} />;
}
