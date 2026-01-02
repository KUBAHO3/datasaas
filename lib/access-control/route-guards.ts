import "server-only";

import {
  requireAuth,
  requireCompany,
  requireRole,
  requireSuperAdmin,
} from "./permissions";
import { getRoleArray } from "../constants/rbac-roles";

export async function dashboardGuard() {
  return await requireAuth();
}

export async function adminGuard() {
  return await requireSuperAdmin();
}

export async function companyGuard() {
  return await requireCompany();
}

export async function ownerGuard(companyId?: string) {
  return await requireRole(getRoleArray("OWNER_AND_ADMIN"), companyId);
}

export async function editorGuard(companyId?: string) {
  return await requireRole(getRoleArray("EDITOR_AND_ABOVE"), companyId);
}
