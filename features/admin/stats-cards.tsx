import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle2, Clock, XCircle, Users } from "lucide-react";

interface StatsCardsProps {
    stats: {
        totalCompanies: number;
        activeCompanies: number;
        pendingApplications: number;
        suspendedCompanies: number;
        totalUsers: number;
    };
}

export function StatsCards({ stats }: StatsCardsProps) {
    const cards = [
        {
            title: "Total Companies",
            value: stats.totalCompanies,
            icon: Building2,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950",
        },
        {
            title: "Active Companies",
            value: stats.activeCompanies,
            icon: CheckCircle2,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950",
        },
        {
            title: "Pending Applications",
            value: stats.pendingApplications,
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50 dark:bg-yellow-950",
        },
        {
            title: "Suspended Companies",
            value: stats.suspendedCompanies,
            icon: XCircle,
            color: "text-red-600",
            bgColor: "bg-red-50 dark:bg-red-950",
        },
        {
            title: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {cards.map((card) => (
                <Card key={card.title}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {card.title}
                        </CardTitle>
                        <div className={`rounded-full p-2 ${card.bgColor}`}>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}