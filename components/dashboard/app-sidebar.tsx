import Link from "next/link"
import NavItems from "./nav-items"
import UserMenu from "./user-menu"

export interface NavItem {
  title: string
  href: string
  icon: string  // ✅ Changed from React.ComponentType to string
}

interface AppSidebarProps {
  navItems: NavItem[]
  user: {
    name: string
    email: string
    role: string
  }
}

export default function AppSidebar({ navItems, user }: AppSidebarProps) {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">DS</span>
          </div>
          <span className="text-lg font-semibold">DataSaaS</span>
        </Link>
      </div>

      <div className="flex-1 p-4">
        <NavItems items={navItems} />
      </div>

      <UserMenu user={user} />
    </div>
  )
}