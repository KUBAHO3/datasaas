import type { RBACRole } from "./rbac-roles";

/**
 * Centralized job title constants
 * Use these instead of hardcoding job title strings
 */
export const JOB_TITLES = {
  // Executive Level (Owner permissions)
  CEO: "ceo",
  CTO: "cto",
  CFO: "cfo",
  COO: "coo",
  FOUNDER: "founder",
  CO_FOUNDER: "co-founder",

  // Management Level (Admin permissions)
  DIRECTOR: "director",
  MANAGER: "manager",
  ADMINISTRATOR: "administrator",

  // Senior/Lead Level (Editor permissions)
  TEAM_LEAD: "team-lead",
  SENIOR_DEVELOPER: "senior-developer",
  DEVELOPER: "developer",

  // Junior/Support Level (Viewer permissions)
  ANALYST: "analyst",
  CONSULTANT: "consultant",
  OTHER: "other",
} as const;

export type JobTitle = (typeof JOB_TITLES)[keyof typeof JOB_TITLES];

/**
 * Company roles with their associated permission levels
 * Each job title maps to an RBAC permission level
 */
export const COMPANY_ROLES = [
  { value: JOB_TITLES.CEO, label: "CEO (Chief Executive Officer)", permissionLevel: "owner" as RBACRole },
  { value: JOB_TITLES.CTO, label: "CTO (Chief Technology Officer)", permissionLevel: "owner" as RBACRole },
  { value: JOB_TITLES.CFO, label: "CFO (Chief Financial Officer)", permissionLevel: "owner" as RBACRole },
  { value: JOB_TITLES.COO, label: "COO (Chief Operating Officer)", permissionLevel: "owner" as RBACRole },
  { value: JOB_TITLES.FOUNDER, label: "Founder", permissionLevel: "owner" as RBACRole },
  { value: JOB_TITLES.CO_FOUNDER, label: "Co-Founder", permissionLevel: "owner" as RBACRole },
  { value: JOB_TITLES.DIRECTOR, label: "Director", permissionLevel: "admin" as RBACRole },
  { value: JOB_TITLES.MANAGER, label: "Manager", permissionLevel: "admin" as RBACRole },
  { value: JOB_TITLES.TEAM_LEAD, label: "Team Lead", permissionLevel: "editor" as RBACRole },
  { value: JOB_TITLES.SENIOR_DEVELOPER, label: "Senior Developer", permissionLevel: "editor" as RBACRole },
  { value: JOB_TITLES.DEVELOPER, label: "Developer", permissionLevel: "editor" as RBACRole },
  { value: JOB_TITLES.ANALYST, label: "Analyst", permissionLevel: "viewer" as RBACRole },
  { value: JOB_TITLES.CONSULTANT, label: "Consultant", permissionLevel: "viewer" as RBACRole },
  { value: JOB_TITLES.ADMINISTRATOR, label: "Administrator", permissionLevel: "admin" as RBACRole },
  { value: JOB_TITLES.OTHER, label: "Other", permissionLevel: "viewer" as RBACRole },
] as const;

export type CompanyRoleValue = (typeof COMPANY_ROLES)[number]["value"];

export function getRoleLabel(value: string): string {
  const role = COMPANY_ROLES.find((r) => r.value === value);
  return role?.label || value;
}

export function isValidRole(value: string): boolean {
  return COMPANY_ROLES.some((r) => r.value === value);
}

/**
 * Check if a value is a valid job title
 */
export function isValidJobTitle(value: string): value is JobTitle {
  return Object.values(JOB_TITLES).includes(value as JobTitle);
}

/**
 * Get the RBAC permission level for a job title
 * @param jobTitle - The job title (e.g., "ceo", "manager")
 * @returns The RBAC permission level (owner, admin, editor, viewer)
 */
export function getPermissionLevel(jobTitle: string): RBACRole | null {
  const role = COMPANY_ROLES.find((r) => r.value === jobTitle);
  return role?.permissionLevel || null;
}

/**
 * Check if a job title has at least the required permission level
 * @param jobTitle - The job title to check
 * @param requiredPermission - The minimum required permission level
 */
export function hasJobTitlePermission(
  jobTitle: string,
  requiredPermission: RBACRole
): boolean {
  const permissionLevel = getPermissionLevel(jobTitle);
  if (!permissionLevel) return false;

  // Import ROLE_HIERARCHY at runtime to avoid circular dependency
  const { ROLE_HIERARCHY } = require("./rbac-roles");
  const jobTitleIndex = ROLE_HIERARCHY.indexOf(permissionLevel);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredPermission);

  return jobTitleIndex >= requiredIndex;
}

/**
 * Grouped job titles by permission level
 * Use these instead of hardcoding job title arrays
 */
export const JOB_TITLE_GROUPS = {
  /** Executive level - maps to owner permissions */
  EXECUTIVES: [
    JOB_TITLES.CEO,
    JOB_TITLES.CTO,
    JOB_TITLES.CFO,
    JOB_TITLES.COO,
    JOB_TITLES.FOUNDER,
    JOB_TITLES.CO_FOUNDER,
  ] as const,

  /** Management level - maps to admin permissions */
  MANAGERS: [
    JOB_TITLES.DIRECTOR,
    JOB_TITLES.MANAGER,
    JOB_TITLES.ADMINISTRATOR,
  ] as const,

  /** Senior/Lead level - maps to editor permissions */
  SENIOR_STAFF: [
    JOB_TITLES.TEAM_LEAD,
    JOB_TITLES.SENIOR_DEVELOPER,
    JOB_TITLES.DEVELOPER,
  ] as const,

  /** Junior/Support level - maps to viewer permissions */
  SUPPORT_STAFF: [
    JOB_TITLES.ANALYST,
    JOB_TITLES.CONSULTANT,
    JOB_TITLES.OTHER,
  ] as const,

  /** All job titles */
  ALL: Object.values(JOB_TITLES) as JobTitle[],
} as const;
