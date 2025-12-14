import { FormSessionModel } from "@/lib/services/models/form.model";
import { FormSubmissionAdminModel } from "@/lib/services/models/form-submission.model";
import { SubmissionValueAdminModel } from "@/lib/services/models/submission-value.model";
import { SubmissionHelpers } from "@/lib/utils/submission-utils";
import { DataCollectionClient } from "./data-collection-client";

interface DataCollectionContentProps {
    orgId: string;
    formId?: string;
}

export async function DataCollectionContent({
    orgId,
    formId,
}: DataCollectionContentProps) {
    // Get all published forms for the company
    const formModel = new FormSessionModel();
    const forms = await formModel.listByCompany(orgId, "published");

    // Get selected form
    const selectedForm = formId
        ? forms.find((f) => f.$id === formId) || forms[0]
        : forms[0];

    if (!selectedForm) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">
                    No published forms found. Create a form to start collecting data.
                </p>
            </div>
        );
    }

    // Get submissions for selected form
    const submissionModel = new FormSubmissionAdminModel();
    const submissions = await submissionModel.listByForm(selectedForm.$id);

    // Get field values for all submissions
    const valueModel = new SubmissionValueAdminModel();
    const rows = await Promise.all(
        submissions.map(async (submission) => {
            const values = await valueModel.getBySubmissionId(submission.$id);
            return SubmissionHelpers.toRow(submission as any, values);
        })
    );

    return (
        <DataCollectionClient
            forms={forms}
            selectedForm={selectedForm}
            initialRows={rows}
            orgId={orgId}
        />
    );
}