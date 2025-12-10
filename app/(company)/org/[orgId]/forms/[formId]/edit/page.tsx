import { FormBuilder } from "@/features/forms/form-builder";
import { requireCompanyAccess } from "@/lib/access-control/permissions";
import { FormAdminModel } from "@/lib/services/models/form.model";
import { notFound } from "next/navigation";

interface FormEditPageProps {
    params: Promise<{ orgId: string; formId: string }>;
}

export default async function FormEditPage({ params }: FormEditPageProps) {
    const { orgId, formId } = await params;
    await requireCompanyAccess(orgId);

    const formModel = new FormAdminModel();
    const form = await formModel.findById(formId);

    if (!form || form.companyId !== orgId) {
        return <div className="text-4xl text-amber-700 mt-16 text-center">Form not found</div>
    }

    return <FormBuilder form={form} orgId={orgId} />;
}