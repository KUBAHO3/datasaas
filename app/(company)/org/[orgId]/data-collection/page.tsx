import { Suspense } from "react";
import { requireCompanyAccess } from "@/lib/access-control/permissions";
import { Skeleton } from "@/components/ui/skeleton";
import { DataCollectionContent } from "@/features/data-collection/data-collection-content";

interface DataCollectionPageProps {
    params: Promise<{ orgId: string }>;
    searchParams: Promise<{ formId?: string }>;
}

export default async function DataCollectionPage({
    params,
    searchParams,
}: DataCollectionPageProps) {
    const { orgId } = await params;
    const { formId } = await searchParams;
    const userContext = await requireCompanyAccess(orgId);

    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Data Collection</h1>
                    <p className="text-muted-foreground">
                        View, filter, and export your form submissions
                    </p>
                </div>
            </div>

            <Suspense fallback={<DataCollectionSkeleton />}>
                <DataCollectionContent orgId={orgId} formId={formId} />
            </Suspense>
        </div>
    );
}

function DataCollectionSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
}