"use server";

import { CompanyAdminModel } from "../models/company.model";
import { revalidatePath } from "next/cache";
import {
  activateCompanySchema,
  approveCompanySchema,
  rejectCompanySchema,
  suspendCompanySchema,
} from "@/lib/schemas/company-schemas";
import { AdminUsersService } from "../models/users.model";
import { AdminTeamsService } from "../core/base-teams";
import { action, superAdminAction } from "@/lib/safe-action";

export async function getDashboardStats() {
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

export const approveCompanyAction = superAdminAction
  .inputSchema(approveCompanySchema)
  .action(async ({ parsedInput: { companyId }, ctx }) => {
    try {
      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findById(companyId);

      if (!company) {
        return { error: "Company not found" };
      }

      if (company.status !== "pending") {
        return { error: "Company is not pending approval" };
      }

      const teamsService = new AdminTeamsService();
      const team = await teamsService.create({
        name: company.companyName,
        roles: ["owner"],
      });

      await companyModel.updateById(companyId, {
        status: "active",
        teamId: team.$id,
        approvedBy: ctx.userId,
        approvedAt: new Date().toISOString(),
      });

      revalidatePath("/admin");
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

export const rejectCompanyAction = superAdminAction
  .inputSchema(rejectCompanySchema)
  .action(async ({ parsedInput: { companyId, reason }, ctx }) => {
    try {
      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findById(companyId);

      if (!company) {
        return { error: "Company not found" };
      }

      if (company.status !== "pending") {
        return { error: "Company is not pending approval" };
      }

      await companyModel.updateById(companyId, {
        status: "rejected",
        rejectedBy: ctx.userId,
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason,
      });

      revalidatePath("/admin");
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
  .inputSchema(suspendCompanySchema)
  .action(async ({ parsedInput: { companyId } }) => {
    try {
      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findById(companyId);

      if (!company) {
        return { error: "Company not found" };
      }

      if (company.status !== "active") {
        return { error: "Only active companies can be suspended" };
      }

      await companyModel.updateById(companyId, {
        status: "suspended",
      });

      revalidatePath("/admin");
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

export const activateCompanyAction = superAdminAction
  .schema(activateCompanySchema)
  .action(async ({ parsedInput: { companyId } }) => {
    try {
      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findById(companyId);

      if (!company) {
        return { error: "Company not found" };
      }

      if (company.status !== "suspended") {
        return { error: "Only suspended companies can be activated" };
      }

      await companyModel.updateById(companyId, {
        status: "active",
      });

      revalidatePath("/admin");
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
