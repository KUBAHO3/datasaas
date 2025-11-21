"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Company } from "@/lib/types/company-types";

interface RecentApplicationsProps {
    applications: Company[];
}

export function RecentApplications({ applications }: RecentApplicationsProps) {
    const router = useRouter();

    if (applications.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>No pending applications at the moment</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>
                    Latest company registration applications pending approval
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {applications.map((app) => (
                        <div
                            key={app.$id}
                            className="flex items-center justify-between rounded-lg border p-4"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold">{app.name}</h4>
                                    <span className="rounded-full bg-yellow-100 dark:bg-yellow-900 px-2 py-0.5 text-xs text-yellow-700 dark:text-yellow-300">
                                        Pending
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{app.email}</p>
                                {app.industry && (
                                    <p className="text-xs text-muted-foreground">
                                        Industry: {app.industry}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Applied {formatDistanceToNow(new Date(app.$createdAt), { addSuffix: true })}
                                </p>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/admin/companies?highlight=${app.$id}`)}
                            >
                                View Details
                                <ExternalLink className="ml-2 h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>

                {applications.length > 0 && (
                    <Button
                        variant="outline"
                        className="mt-4 w-full"
                        onClick={() => router.push('/admin/companies')}
                    >
                        View All Applications
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}