import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { CompanyAdminModel } from "@/lib/services/models/company.model";
import { FormAdminModel } from "@/lib/services/models/form.model";
import { SubmissionAnalyticsService } from "@/lib/services/analytics/submission-analytics.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { unstable_cache } from "next/cache";

// Dynamic import for charts (client component with Recharts)
const SubmissionCharts = dynamic(
  () =>
    import("@/features/analytics/submission-charts").then(
      (mod) => mod.SubmissionCharts
    ),
  {
    loading: () => <ChartsSkeleton />,
    ssr: false, // Recharts works better on client-side
  }
);

interface AnalyticsPageProps {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ formId?: string }>;
}

export default async function AnalyticsPage({
  params,
  searchParams,
}: AnalyticsPageProps) {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }

  const { orgId } = await params;
  const { formId } = await searchParams;

  // Get company
  const companyModel = new CompanyAdminModel();
  const company = await companyModel.findById(orgId);

  if (!company) {
    redirect("/");
  }

  // Get forms
  const formModel = new FormAdminModel();
  const forms = await formModel.findMany({
    where: [{ field: "companyId", operator: "equals", value: orgId }],
  });

  const publishedForms = forms.filter((f) => f.status === "published");

  if (publishedForms.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No published forms yet. Create and publish a form to see analytics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedForm = formId
    ? publishedForms.find((f) => f.$id === formId) || publishedForms[0]
    : publishedForms[0];

  // Fetch analytics with caching
  const getAnalytics = unstable_cache(
    async (formId: string, companyId: string) => {
      const analyticsService = new SubmissionAnalyticsService();
      const [analytics, fieldAnalytics] = await Promise.all([
        analyticsService.getFormAnalytics(formId, companyId),
        analyticsService.getFieldAnalytics(
          formId,
          companyId,
          selectedForm
        ),
      ]);
      return { analytics, fieldAnalytics };
    },
    [`analytics-${selectedForm.$id}`],
    {
      revalidate: 300, // Cache for 5 minutes
      tags: [`analytics-${selectedForm.$id}`],
    }
  );

  const { analytics, fieldAnalytics } = await getAnalytics(
    selectedForm.$id,
    company.$id
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Form submission insights and trends
          </p>
        </div>

        {publishedForms.length > 1 && (
          <Select defaultValue={selectedForm.$id}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a form" />
            </SelectTrigger>
            <SelectContent>
              {publishedForms.map((form) => (
                <SelectItem key={form.$id} value={form.$id}>
                  {form.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Suspense fallback={<ChartsSkeleton />}>
        <SubmissionCharts
          analytics={analytics}
          fieldAnalytics={fieldAnalytics}
        />
      </Suspense>
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
