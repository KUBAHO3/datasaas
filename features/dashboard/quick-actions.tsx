import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, FileText, Upload, UserPlus } from "lucide-react";
import Link from "next/link";
import { ROLE_ARRAYS } from "@/lib/constants/rbac-roles";

interface QuickActionsProps {
    orgId: string;
    userRole: string;
}

export function QuickActions({ orgId, userRole }: QuickActionsProps) {
    const canCreate = ROLE_ARRAYS.EDITOR_AND_ABOVE.includes(userRole as any);
    const canManageUsers = ROLE_ARRAYS.OWNER_AND_ADMIN.includes(userRole as any);

    const actions = [
        {
            title: "Create New Form",
            description: "Build a custom data collection form",
            icon: FileText,
            href: `/org/${orgId}/forms/create`,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950",
            enabled: canCreate,
        },
        {
            title: "Upload Data",
            description: "Import data from Excel or CSV",
            icon: Upload,
            href: `/org/${orgId}/data-collection/import`,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950",
            enabled: canCreate,
        },
        {
            title: "View Data",
            description: "Browse and manage collected data",
            icon: Database,
            href: `/org/${orgId}/data-collection`,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950",
            enabled: true,
        },
        {
            title: "Manage Users",
            description: "Invite and manage team members",
            icon: UserPlus,
            href: `/org/${orgId}/users`,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-950",
            enabled: canManageUsers,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {actions.map((action) => {
                const Icon = action.icon;
                return (
                    <Card
                        key={action.title}
                        className={action.enabled ? "hover:shadow-md transition-shadow" : "opacity-60"}
                    >
                        <CardHeader>
                            <div className={`rounded-full p-3 w-fit ${action.bgColor}`}>
                                <Icon className={`h-6 w-6 ${action.color}`} />
                            </div>
                            <CardTitle className="text-base">{action.title}</CardTitle>
                            <CardDescription className="text-xs">
                                {action.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {action.enabled ? (
                                <Button asChild className="w-full">
                                    <Link href={action.href}>Get Started</Link>
                                </Button>
                            ) : (
                                <Button disabled className="w-full">
                                    Restricted
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}