"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SubmissionAnalytics, FieldAnalytics } from "@/lib/types/submission-types";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, CheckCircle, Clock, Zap } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

interface SubmissionChartsProps {
  analytics: SubmissionAnalytics;
  fieldAnalytics?: FieldAnalytics[];
}

export function SubmissionCharts({ analytics, fieldAnalytics }: SubmissionChartsProps) {
  const statusData = [
    { name: "Completed", value: analytics.completedSubmissions, color: "#22c55e" },
    { name: "Draft", value: analytics.draftSubmissions, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completedSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.conversionRate.toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.draftSubmissions}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averageCompletionTime > 0
                ? `${Math.round(analytics.averageCompletionTime / 60)}m`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Submission Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Trends</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.submissionsByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Submissions"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Completed vs Draft</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Field Analytics */}
      {fieldAnalytics && fieldAnalytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Field Analytics</CardTitle>
            <CardDescription>Response distribution for each field</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {fieldAnalytics.map((field) => (
                <div key={field.fieldId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{field.fieldLabel}</h4>
                      <p className="text-sm text-muted-foreground">
                        {field.totalResponses} responses
                      </p>
                    </div>
                    <Badge variant="outline">{field.fieldType}</Badge>
                  </div>

                  {/* Numeric Stats */}
                  {field.numericStats && (
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Min:</span>{" "}
                        <span className="font-medium">{field.numericStats.min}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max:</span>{" "}
                        <span className="font-medium">{field.numericStats.max}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg:</span>{" "}
                        <span className="font-medium">
                          {field.numericStats.avg.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Median:</span>{" "}
                        <span className="font-medium">{field.numericStats.median}</span>
                      </div>
                    </div>
                  )}

                  {/* Distribution Chart */}
                  {field.distribution && field.distribution.length > 0 && (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={field.distribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="value" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8">
                          {field.distribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
