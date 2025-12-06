import { NavItem } from "./app-sidebar";

export const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: "LayoutDashboard",
  },
  {
    title: "Companies",
    href: "/admin/companies",
    icon: "Building2",
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: "Users",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: "Settings",
  },
];

export const companyNavItems = (orgId: string): NavItem[] => [
  {
    title: "Dashboard",
    href: `/org/${orgId}`,
    icon: "LayoutDashboard",
  },
  {
    title: "Forms",
    href: `/org/${orgId}/forms`,
    icon: "FileText",
  },
  {
    title: "Data",
    href: `/org/${orgId}/data`,
    icon: "Database",
  },
  {
    title: "Settings",
    href: `/org/${orgId}/settings`,
    icon: "Settings",
  },
];
