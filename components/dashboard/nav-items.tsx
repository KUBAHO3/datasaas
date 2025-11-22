"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NavItem } from "./app-sidebar"
import { BarChart3, Building2, Database, FileText, LayoutDashboard, Settings, Users } from "lucide-react"

export default function NavItems({ items }: { items: NavItem[] }) {
    const pathname = usePathname()

    return (
        <nav className="space-y-1">
            {items.map((item) => {
                const active =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/")

                const Icon = item.icon

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                            active
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {item.title}
                    </Link>
                )
            })}
        </nav>
    )
}

export const adminNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Companies",
        href: "/admin/companies",
        icon: Building2,
    },
    {
        title: "Users",
        href: "/admin/users",
        icon: Users,
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
]

export const companyNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Forms",
        href: "/dashboard/forms",
        icon: FileText,
    },
    {
        title: "Data",
        href: "/dashboard/data",
        icon: Database,
    },
    {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
    },
    {
        title: "Team",
        href: "/dashboard/team",
        icon: Users,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
]
