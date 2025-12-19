import { FormSessionModel } from "@/lib/services/models/form.model";
import { FormSubmissionAdminModel } from "@/lib/services/models/form-submission.model";
import { SubmissionValueAdminModel } from "@/lib/services/models/submission-value.model";
import { SubmissionHelpers } from "@/lib/utils/submission-utils";
import { DataCollectionClient } from "./data-collection-client";
import { DataCollectionStats } from "./data-collection-stats";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
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
        <div className="space-y-6">
            {/* Stats Section with Suspense for Streaming */}
            <Suspense fallback={<StatsLoadingSkeleton />}>
                <DataCollectionStats formId={selectedForm.$id} />
            </Suspense>

            {/* Main Data Collection Interface */}
            <DataCollectionClient
                forms={forms}
                selectedForm={selectedForm}
                initialRows={rows}
                orgId={orgId}
            />
        </div>
    );
}

function StatsLoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-[120px] ${i >= 4 ? "md:col-span-2" : ""}`}
                />
            ))}
        </div>
    );
}