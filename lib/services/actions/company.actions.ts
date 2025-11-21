"use server";

import { createSafeActionClient } from "next-safe-action";
import { CompanyAdminModel } from "../models/company.model";
import { revalidatePath } from "next/cache";
import {
  activateCompanySchema,
  approveCompanySchema,
  rejectCompanySchema,
  suspendCompanySchema,
} from "@/lib/schemas/company-schemas";
import { requireSuperAdmin } from "@/lib/access-control/permissions";
import { AdminUsersService } from "../models/users.model";
import { AdminTeamsService } from "../core/base-teams";

const action = createSafeActionClient({
  handleServerError: (error) => {
    console.error("Action error:", error);
    return error.message;
  },
});

export async function getDashboardStats() {
  await requireSuperAdmin();

  const companyModel = new CompanyAdminModel();
  const stats = await companyModel.getStats();
  const recentApplications = await companyModel.getPendingApplications(5);

  const adminUsersService = new AdminUsersService();
  const usersList = await adminUsersService.list();

  return {
    totalCompanies: stats.total,
    activeCompanies: stats.active,
    pendingApplications: stats.pending,
    suspendedCompanies: stats.suspended,
    totalUsers: usersList.total,
    recentApplications,
  };
}

export async function getCompanies(status?: string) {
  await requireSuperAdmin();

  const companyModel = new CompanyAdminModel();

  const options = status
    ? {
        where: [
          { field: "status", operator: "equals" as const, value: status },
        ],
      }
    : {};

  return companyModel.findMany({
    ...options,
    orderBy: [{ field: "$createdAt", direction: "desc" }],
  });
}

export const approveCompanyAction = action
  .schema(approveCompanySchema)
  .action(async ({ parsedInput: { companyId } }) => {
    const userContext = await requireSuperAdmin();

    try {
      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findById(companyId);

      if (!company) {
        throw new Error("Company not found");
      }

      if (company.status !== "pending") {
        throw new Error("Company is not pending approval");
      }

      const teamsService = new AdminTeamsService();
      const team = await teamsService.create({
        name: company.name,
        roles: ["owner"],
      });

      await companyModel.updateById(companyId, {
        status: "active",
        teamId: team.$id,
        approvedBy: userContext.userId,
        approvedAt: new Date().toISOString(),
      });

      revalidatePath("/admin/dashboard");
      revalidatePath("/admin/companies");

      return {
        success: true,
        message: "Company approved successfully",
        teamId: team.$id,
      };
    } catch (error) {
      console.error("Approve company error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to approve company",
      };
    }
  });

export const rejectCompanyAction = action
  .schema(rejectCompanySchema)
  .action(async ({ parsedInput: { companyId, reason } }) => {
    const userContext = await requireSuperAdmin();

    try {
      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findById(companyId);

      if (!company) {
        throw new Error("Company not found");
      }

      if (company.status !== "pending") {
        return { error: "Company is not pending approval" };
      }

      await companyModel.updateById(companyId, {
        status: "rejected",
        rejectedBy: userContext.userId,
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason,
      });

      revalidatePath("/admin/dashboard");
      revalidatePath("/admin/companies");

      return {
        success: true,
        message: "Company rejected successfully",
      };
    } catch (error) {
      console.error("Reject company error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to reject company",
      };
    }
  });

export const suspendCompanyAction = action
  .schema(suspendCompanySchema)
  .action(async ({ parsedInput: { companyId } }) => {
    await requireSuperAdmin();

    try {
      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findById(companyId);

      if (!company) {
        throw new Error("Company not found");
      }

      if (company.status !== "active") {
        throw new Error("Only active companies can be suspended");
      }

      await companyModel.updateById(companyId, {
        status: "suspended",
      });

      revalidatePath("/admin/dashboard");
      revalidatePath("/admin/companies");

      return {
        success: true,
        message: "Company suspended successfully",
      };
    } catch (error) {
      console.error("Suspend company error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to suspend company",
      };
    }
  });

export const activateCompanyAction = action
  .schema(activateCompanySchema)
  .action(async ({ parsedInput: { companyId } }) => {
    await requireSuperAdmin();

    try {
      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findById(companyId);

      if (!company) {
        throw new Error("Company not found");
      }

      if (company.status !== "suspended") {
        throw new Error("Only suspended companies can be activated");
      }

      await companyModel.updateById(companyId, {
        status: "active",
      });

      revalidatePath("/admin/dashboard");
      revalidatePath("/admin/companies");

      return {
        success: true,
        message: "Company activated successfully",
      };
    } catch (error) {
      console.error("Activate company error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to activate company",
      };
    }
  });
