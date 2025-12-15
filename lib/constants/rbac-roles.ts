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
