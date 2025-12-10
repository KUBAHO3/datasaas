import { CreateFormCard } from "@/features/forms/create-form-card";
import { requireCompanyAccess } from "@/lib/access-control/permissions";

interface CreateFormPageProps {
    params: Promise<{ orgId: string }>;
}

export default async function CreateFormPage({ params }: CreateFormPageProps) {
    const { orgId } = await params;
    await requireCompanyAccess(orgId);

    return (
        <div className="flex-1 flex items-center justify-center p-6">
            <CreateFormCard orgId={orgId} />
        </div>
    );
}