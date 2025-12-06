import { Suspense } from "react";
import { CompaniesTableWrapper } from "@/features/admin/companies-table-wrapper";
import { CompaniesFilters } from "@/features/admin/companies-filters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { getCompanies } from "@/lib/services/actions/company.actions";

interface AdminCompaniesPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: string;
    search?: string;
    industry?: string;
    highlight?: string;
  }>;
}

function CompaniesLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function CompaniesTable({
  page,
  limit,
  status,
  search,
  industry,
  highlight
}: {
  page: number;
  limit: number;
  status?: string;
  search?: string;
  industry?: string;
  highlight?: string;
}) {
  const { companies, pagination } = await getCompanies(
    {
      page,
      limit,
      status,
      search,
      industry
    }
  );

  return (
    <CompaniesTableWrapper
      initialCompanies={companies}
      pagination={pagination}
      filters={{ status, industry, search }}
      highlightId={highlight}
    />
  );
}

export default async function AdminCompaniesPage({ searchParams }: AdminCompaniesPageProps) {
  const params = await searchParams;

  const page = parseInt(params.page || "1");
  const limit = parseInt(params.limit || "10");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            Manage company registrations and approvals
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/companies/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter companies by status and industry</CardDescription>
        </CardHeader>
        <CardContent>
          <CompaniesFilters />
        </CardContent>
      </Card>

      <Suspense fallback={<CompaniesLoadingSkeleton />}>
        <CompaniesTable
          page={page}
          limit={limit}
          status={params.status}
          search={params.search}
          industry={params.industry}
          highlight={params.highlight}
        />
      </Suspense>
    </div>
  );
}

export const experimental_ppr = true;