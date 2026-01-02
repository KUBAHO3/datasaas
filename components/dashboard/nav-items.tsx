"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NavItem } from "./app-sidebar"
import {
    BarChart3,
    Building2,
    Database,
    FileText,
    LayoutDashboard,
    Settings,
    Users,
    LucideIcon
} from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    Building2,
    Users,
    Settings,
    FileText,
    Database,
    BarChart3,
}

export default function NavItems({ items }: { items: NavItem[] }) {
    const pathname = usePathname()

    if (!items || items.length === 0) {
        return null;
    }

    return (
        <nav className="space-y-1">
            {items.map((item) => {
                const active =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/")

                const Icon = iconMap[item.icon] || LayoutDashboard

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