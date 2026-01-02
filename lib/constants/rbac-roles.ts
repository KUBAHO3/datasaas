/**
 * Centralized RBAC (Role-Based Access Control) roles
 * These roles determine what users can do within their company
 *
 * IMPORTANT: This is different from jobTitle (CEO, Manager, etc.)
 * - jobTitle = User's actual job position (for display)
 * - role = Permission level (for access control)
 */

export const RBAC_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
} as const;

export type RBACRole = (typeof RBAC_ROLES)[keyof typeof RBAC_ROLES];

/**
 * Role hierarchy for permission checks
 * Higher index = more permissions
 */
export const ROLE_HIERARCHY: RBACRole[] = [
  RBAC_ROLES.VIEWER,
  RBAC_ROLES.EDITOR,
  RBAC_ROLES.ADMIN,
  RBAC_ROLES.OWNER,
];

/**
 * Role descriptions for UI display
 */
export const ROLE_DESCRIPTIONS = {
  [RBAC_ROLES.OWNER]: {
    label: "Owner",
    description: "Full control over the company and all resources",
  },
  [RBAC_ROLES.ADMIN]: {
    label: "Admin",
    description: "Manage users, forms, and data",
  },
  [RBAC_ROLES.EDITOR]: {
    label: "Editor",
    description: "Create and edit data and forms",
  },
  [RBAC_ROLES.VIEWER]: {
    label: "Viewer",
    description: "Read-only access to data",
  },
} as const;

/**
 * Helper function to check if a user has at least a certain role level
 */
export function hasMinimumRole(
  userRole: string | undefined,
  requiredRole: RBACRole
): boolean {
  if (!userRole) return false;

  const userRoleIndex = ROLE_HIERARCHY.indexOf(userRole as RBACRole);
  const requiredRoleIndex = ROLE_HIERARCHY.indexOf(requiredRole);

  return userRoleIndex >= requiredRoleIndex;
}

/**
 * Helper function to check if a role is valid
 */
export function isValidRBACRole(role: string): role is RBACRole {
  return Object.values(RBAC_ROLES).includes(role as RBACRole);
}

/**
 * Commonly used role arrays for access control
 * Use these instead of hardcoding role arrays throughout the codebase
 */
export const ROLE_ARRAYS = {
  /** All roles - use for features accessible to all authenticated users */
  ALL_ROLES: [
    RBAC_ROLES.OWNER,
    RBAC_ROLES.ADMIN,
    RBAC_ROLES.EDITOR,
    RBAC_ROLES.VIEWER,
  ] as const,

  /** Owner only - use for critical company settings and billing */
  OWNER_ONLY: [RBAC_ROLES.OWNER] as const,

  /** Owner and Admin - use for user management and company configuration */
  OWNER_AND_ADMIN: [RBAC_ROLES.OWNER, RBAC_ROLES.ADMIN] as const,

  /** Admin and above - includes Owner and Admin */
  ADMIN_AND_ABOVE: [RBAC_ROLES.OWNER, RBAC_ROLES.ADMIN] as const,

  /** Editor and above - includes Owner, Admin, and Editor */
  EDITOR_AND_ABOVE: [
    RBAC_ROLES.OWNER,
    RBAC_ROLES.ADMIN,
    RBAC_ROLES.EDITOR,
  ] as const,

  /** Can modify data - Editor and above */
  CAN_MODIFY: [
    RBAC_ROLES.OWNER,
    RBAC_ROLES.ADMIN,
    RBAC_ROLES.EDITOR,
  ] as const,

  /** Can view only - Viewer role */
  CAN_VIEW_ONLY: [RBAC_ROLES.VIEWER] as const,
} as const;

/**
 * Get roles as a string array (for runtime use in createRoleAction)
 */
export const getRoleArray = (
  roleArrayKey: keyof typeof ROLE_ARRAYS
): string[] => {
  return [...ROLE_ARRAYS[roleArrayKey]] as string[];
};
