import { getCompanies } from "@/lib/services/actions/company.actions";
import { requireSuperAdmin } from "@/lib/access-control/permissions";
import { Suspense } from "react";
import { CompaniesTableWrapper } from "@/features/admin/companies-table-wrapper";
import { CompaniesFilters } from "@/features/admin/companies-filters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Loader2 } from "lucide-react";

interface CompaniesPageProps {
  searchParams: Promise<{
    status?: string;
    industry?: string;
    search?: string;
    page?: string;
    highlight?: string;
  }>;
}

async function CompaniesContent({
  searchParams,
}: {
  searchParams: Awaited<CompaniesPageProps["searchParams"]>;
}) {
  const { status, industry, search, page = "1", highlight } = searchParams;

  const { companies, pagination } = await getCompanies({
    status,
    industry,
    search,
    page: parseInt(page),
    limit: 10,
  });

  return (
    <CompaniesTableWrapper
      initialCompanies={companies}
      pagination={pagination}
      filters={{ status, industry, search }}
      highlightId={highlight}
    />
  );
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  await requireSuperAdmin();
  const resolvedSearchParams = await searchParams;

  return (
    <main className="flex-1 p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground mt-1">
            Manage company registrations and applications
          </p>
        </div>

        <CompaniesFilters />

        <Suspense
          fallback={
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          }
        >
          <CompaniesContent searchParams={resolvedSearchParams} />
        </Suspense>
      </div>
    </main>
  );
}