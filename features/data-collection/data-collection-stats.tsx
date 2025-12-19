import { FormSubmissionAdminModel } from "@/lib/services/models/form-submission.model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    BarChart3,
    CheckCircle2,
    Clock,
    FileText,
    TrendingUp,
    Users,
} from "lucide-react";
import { cache } from "react";

interface DataCollectionStatsProps {
    formId: string;
}

// Use React cache for request-level memoization (stable API)
const getFormSubmissionStats = cache(async (formId: string) => {
    const submissionModel = new FormSubmissionAdminModel();
    const submissions = await submissionModel.listByForm(formId);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const completed = submissions.filter((s) => s.status === "completed");
    const drafts = submissions.filter((s) => s.status === "draft");

    // Recent submissions (last 7 days)
    const recentSubmissions = completed.filter((s) => {
        const submittedAt = s.submittedAt ? new Date(s.submittedAt) : null;
        return submittedAt && submittedAt >= sevenDaysAgo;
    });

    // Last 30 days submissions
    const last30DaysSubmissions = completed.filter((s) => {
        const submittedAt = s.submittedAt ? new Date(s.submittedAt) : null;
        return submittedAt && submittedAt >= thirtyDaysAgo;
    });

    // Calculate average completion time (from started to submitted)
    const completionTimes = completed
        .filter((s) => s.startedAt && s.submittedAt)
        .map((s) => {
            const start = new Date(s.startedAt!).getTime();
            const end = new Date(s.submittedAt!).getTime();
            return (end - start) / 1000 / 60; // in minutes
        });

    const avgCompletionTime =
        completionTimes.length > 0
            ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
            : 0;

    // Unique submitters (non-anonymous)
    const uniqueSubmitters = new Set(
        completed
            .filter((s) => s.submittedBy || s.submittedByEmail)
            .map((s) => s.submittedBy || s.submittedByEmail)
    ).size;

    // Completion rate (completed vs total started)
    const totalStarted = submissions.length;
    const completionRate =
        totalStarted > 0 ? (completed.length / totalStarted) * 100 : 0;

    // Trend: Compare last 7 days with previous 7 days
    const previousWeekStart = new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previousWeekSubmissions = completed.filter((s) => {
        const submittedAt = s.submittedAt ? new Date(s.submittedAt) : null;
        return (
            submittedAt &&
            submittedAt >= previousWeekStart &&
            submittedAt < sevenDaysAgo
        );
    });

    const trendPercentage =
        previousWeekSubmissions.length > 0
            ? ((recentSubmissions.length - previousWeekSubmissions.length) /
                previousWeekSubmissions.length) *
            100
            : recentSubmissions.length > 0
                ? 100
                : 0;

    return {
        total: submissions.length,
        completed: completed.length,
        drafts: drafts.length,
        recentSubmissions: recentSubmissions.length,
        last30DaysSubmissions: last30DaysSubmissions.length,
        avgCompletionTime: Math.round(avgCompletionTime),
        uniqueSubmitters,
        completionRate: Math.round(completionRate),
        trendPercentage: Math.round(trendPercentage),
    };
});

export async function DataCollectionStats({
    formId,
}: DataCollectionStatsProps) {
    const stats = await getFormSubmissionStats(formId);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Submissions */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Submissions
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                            {stats.completed} Completed
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            {stats.drafts} Draft
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Completion Rate */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Completion Rate
                    </CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.completionRate}%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {stats.completed} of {stats.total} started
                    </p>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Recent Activity
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.recentSubmissions}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                        <p className="text-xs text-muted-foreground">
                            Last 7 days
                        </p>
                        {stats.trendPercentage !== 0 && (
                            <Badge
                                variant={stats.trendPercentage > 0 ? "default" : "secondary"}
                                className="text-xs"
                            >
                                {stats.trendPercentage > 0 ? "+" : ""}
                                {stats.trendPercentage}%
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Avg Completion Time */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Avg. Completion Time
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.avgCompletionTime > 60
                            ? `${Math.round(stats.avgCompletionTime / 60)}h`
                            : `${stats.avgCompletionTime}m`}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {stats.completed} responses analyzed
                    </p>
                </CardContent>
            </Card>

            {/* Additional Stats Row */}
            <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Unique Respondents
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.uniqueSubmitters}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Non-anonymous submissions
                    </p>
                </CardContent>
            </Card>

            <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        30-Day Activity
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.last30DaysSubmissions}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Submissions in the last month
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
