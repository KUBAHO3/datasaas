/**
 * Unified Permission Checker
 * Checks permissions based on both RBAC role and job title
 */

import { isValidRBACRole, type RBACRole } from "../constants/rbac-roles";
import { getPermissionLevel, isValidJobTitle } from "../constants/company-roles";

export interface UserPermissionContext {
  role?: string; // RBAC role (owner, admin, editor, viewer)
  jobTitle?: string; // Job title (ceo, manager, developer, etc.)
}

/**
 * Get the effective permission level for a user
 * Checks both RBAC role and job title, returns the higher permission level
 */
export function getEffectivePermission(
  context: UserPermissionContext
): RBACRole | null {
  const { role, jobTitle } = context;

  // Check RBAC role (validate it's a valid RBAC role)
  const rbacPermission = role && isValidRBACRole(role) ? (role as RBACRole) : null;

  // Check job title permission (validate it's a valid job title)
  const jobTitlePermission =
    jobTitle && isValidJobTitle(jobTitle) ? getPermissionLevel(jobTitle) : null;

  // If both are null, no permission
  if (!rbacPermission && !jobTitlePermission) {
    return null;
  }

  // If only one is set, use that
  if (rbacPermission && !jobTitlePermission) return rbacPermission;
  if (jobTitlePermission && !rbacPermission) return jobTitlePermission;

  // If both are set, return the higher permission level
  const { ROLE_HIERARCHY } = require("../constants/rbac-roles");
  const rbacIndex = ROLE_HIERARCHY.indexOf(rbacPermission);
  const jobTitleIndex = ROLE_HIERARCHY.indexOf(jobTitlePermission);

  return rbacIndex >= jobTitleIndex ? rbacPermission! : jobTitlePermission!;
}

/**
 * Check if user has permission based on either RBAC role or job title
 * @param context - User's role and/or job title
 * @param allowedRoles - Array of allowed RBAC roles
 * @returns true if user has permission via role OR job title
 */
export function hasPermission(
  context: UserPermissionContext,
  allowedRoles: string[]
): boolean {
  const { role, jobTitle } = context;

  // Check RBAC role directly (must be valid)
  if (role && isValidRBACRole(role) && allowedRoles.includes(role)) {
    return true;
  }

  // Check if job title maps to an allowed permission level (must be valid)
  if (jobTitle && isValidJobTitle(jobTitle)) {
    const jobTitlePermission = getPermissionLevel(jobTitle);
    if (jobTitlePermission && allowedRoles.includes(jobTitlePermission)) {
      return true;
    }
  }

  return false;
}

/**
 * Get a user-friendly permission description
 */
export function getPermissionDescription(context: UserPermissionContext): string {
  const effectivePermission = getEffectivePermission(context);

  if (!effectivePermission) {
    return "No permissions assigned";
  }

  const parts: string[] = [];

  if (context.role) {
    parts.push(`Role: ${context.role}`);
  }

  if (context.jobTitle) {
    const jobTitlePerm = getPermissionLevel(context.jobTitle);
    parts.push(`Job Title: ${context.jobTitle} (${jobTitlePerm} level)`);
  }

  parts.push(`Effective Permission: ${effectivePermission}`);

  return parts.join(" | ");
}
