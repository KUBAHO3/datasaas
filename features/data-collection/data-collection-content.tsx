import { FormSessionModel } from "@/lib/services/models/form.model";
import { FormSubmissionAdminModel } from "@/lib/services/models/form-submission.model";
import { SubmissionValueAdminModel } from "@/lib/services/models/submission-value.model";
import { SubmissionHelpers } from "@/lib/utils/submission-utils";
import { DataCollectionClient } from "./data-collection-client";
import { cache } from "react";

interface DataCollectionContentProps {
    orgId: string;
    formId?: string;
}

const getPublishedForms = cache(async (orgId: string) => {
    const formModel = new FormSessionModel();
    return await formModel.listByCompany(orgId, "published");
});

const getSubmissionsWithValues = cache(async (formId: string) => {
    const submissionModel = new FormSubmissionAdminModel();
    const submissions = await submissionModel.listByForm(formId);

    const valueModel = new SubmissionValueAdminModel();

    const rows = await Promise.all(
        submissions.map(async (submission) => {
            const values = await valueModel.getBySubmissionId(submission.$id);
            return SubmissionHelpers.toRow(submission as any, values);
        })
    );

    return rows;
});

export async function DataCollectionContent({
    orgId,
    formId,
}: DataCollectionContentProps) {
    const forms = await getPublishedForms(orgId);

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

    const rows = await getSubmissionsWithValues(selectedForm.$id);

    return (
        <DataCollectionClient
            forms={forms}
            selectedForm={selectedForm}
            initialRows={rows}
            orgId={orgId}
        />
    );
}