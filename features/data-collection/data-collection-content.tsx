import { FormSessionModel } from "@/lib/services/models/form.model";
import { FormSubmissionAdminModel } from "@/lib/services/models/form-submission.model";
import { SubmissionValueAdminModel } from "@/lib/services/models/submission-value.model";
import { SubmissionHelpers } from "@/lib/utils/submission-utils";
import { DataCollectionClient } from "./data-collection-client";
import { unstable_cache } from "next/cache";

interface DataCollectionContentProps {
    orgId: string;
    formId?: string;
}

// Cached function to fetch forms
const getPublishedForms = (orgId: string) =>
    unstable_cache(
        async () => {
            const formModel = new FormSessionModel();
            return await formModel.listByCompany(orgId, "published");
        },
        [`published-forms-${orgId}`],
        {
            revalidate: 60, // Cache for 1 minute
            tags: [`forms-${orgId}`],
        }
    )();

// Cached function to fetch submissions with values
const getSubmissionsWithValues = (formId: string) =>
    unstable_cache(
        async () => {
            const submissionModel = new FormSubmissionAdminModel();
            const submissions = await submissionModel.listByForm(formId);

            const valueModel = new SubmissionValueAdminModel();

            // Fetch all submission values in parallel for better performance
            const rows = await Promise.all(
                submissions.map(async (submission) => {
                    const values = await valueModel.getBySubmissionId(submission.$id);
                    return SubmissionHelpers.toRow(submission as any, values);
                })
            );

            return rows;
        },
        [`submissions-with-values-${formId}`],
        {
            revalidate: 30, // Cache for 30 seconds (more dynamic data)
            tags: [`submissions-${formId}`],
        }
    )();

export async function DataCollectionContent({
    orgId,
    formId,
}: DataCollectionContentProps) {
    // Get all published forms for the company (cached)
    const forms = await getPublishedForms(orgId);

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

    // Get submissions for selected form (cached)
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