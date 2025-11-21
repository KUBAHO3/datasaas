import "server-only";

import {
  requireAuth,
  requireCompany,
  requireRole,
  requireSuperAdmin,
} from "./permissions";

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
  return await requireRole(["owner", "admin"], companyId);
}

export async function editorGuard(companyId?: string) {
  return await requireRole(["owner", "admin", "editor"], companyId);
}
