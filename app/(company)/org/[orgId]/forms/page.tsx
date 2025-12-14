import { Button } from "@/components/ui/button";
import { FormsList } from "@/features/forms/forms-list";
import { FormsListSkeleton } from "@/features/forms/forms-list-skeleton";
import { requireCompanyAccess } from "@/lib/access-control/permissions";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

interface FormsPageProps {
    params: Promise<{ orgId: string }>;
}

export default async function FormsPage({ params }: FormsPageProps) {
    const { orgId } = await params;
    const userContext = await requireCompanyAccess(orgId);

    const canCreate = ["owner", "admin", "editor", "CEO"].includes(userContext.role || "");

    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
                    <p className="text-muted-foreground">
                        Create and manage your data collection forms
                    </p>
                </div>
                {canCreate && (
                    <Button asChild>
                        <Link href={`/org/${orgId}/forms/create`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Form
                        </Link>
                    </Button>
                )}
            </div>

            <Suspense fallback={<FormsListSkeleton />}>
                <FormsList orgId={orgId} />
            </Suspense>
        </div>
    )
}