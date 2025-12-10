import { requireCompanyAccess } from "@/lib/access-control/permissions";
import { FormAdminModel } from "@/lib/services/models/form.model";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormPreview } from "@/features/forms/form-preview";

interface FormPreviewPageProps {
    params: Promise<{ orgId: string; formId: string }>;
}

export default async function FormPreviewPage({ params }: FormPreviewPageProps) {
    const { orgId, formId } = await params;
    await requireCompanyAccess(orgId);

    const formModel = new FormAdminModel();
    const form = await formModel.findById(formId);

    if (!form || form.companyId !== orgId) {
        return <div className="text-4xl text-amber-700 mt-16 text-center">Form not found</div>
    }

    return (
        <div className="min-h-screen bg-muted/20">
            <div className="border-b bg-background/95 backdrop-blur">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/org/${orgId}/forms/${formId}/edit`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Editor
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold">Form Preview</h1>
                        <p className="text-sm text-muted-foreground">
                            This is how your form will appear to users
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <FormPreview form={form} />
            </div>
        </div>
    )
}