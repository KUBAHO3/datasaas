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
    title: "Data Collection",
    href: `/org/${orgId}/data-collection`,
    icon: "Database",
  },
  {
    title: "Users",
    href: `/org/${orgId}/users`,
    icon: "Users",
  },
  {
    title: "Settings",
    href: `/org/${orgId}/settings`,
    icon: "Settings",
  },
];
