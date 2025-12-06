"use server";

import { CompanyAdminModel } from "../models/company.model";
import { revalidatePath } from "next/cache";
import {
  activateCompanySchema,
  approveCompanySchema,
  bulkApproveSchema,
  bulkRejectSchema,
  deleteCompanySchema,
  getCompanyDetailsSchema,
  rejectCompanySchema,
  resendNotificationSchema,
  suspendCompanySchema,
  updateCompanySchema,
} from "@/lib/schemas/company-schemas";
import { AdminUsersService, UserDataAdminModel } from "../models/users.model";
import { AdminTeamsService } from "../core/base-teams";
import { action, superAdminAction } from "@/lib/safe-action";
import {
  sendCompanyActivatedEmail,
  sendCompanyApprovedEmail,
  sendCompanyRejectedEmail,
  sendCompanySuspendedEmail,
} from "../email/company-emails";
import { Company } from "@/lib/types/company-types";
import { FindOptions, WhereClause } from "../core/base-db-model";
import { Permission, Role } from "node-appwrite";

interface CompaniesFilters {
  status?: string;
  industry?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CompaniesResponse {
  companies: Company[];
  pagination: PaginationResult;
}

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

export async function getCompanies(filters?: CompaniesFilters) {
  const companyModel = new CompanyAdminModel();

  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const offset = (page - 1) * limit;

  const whereConditions: WhereClause[] = [];

  if (filters?.status) {
    whereConditions.push({
      field: "status",
      operator: "equals",
      value: filters.status,
    });
  }

  if (filters?.industry) {
    whereConditions.push({
      field: "industry",
      operator: "equals",
      value: filters.industry,
    });
  }

  if (filters?.search) {
    whereConditions.push({
      field: "companyName",
      operator: "contains",
      value: filters.search,
    });
  }

  const findOptions: FindOptions = {
    where: whereConditions.length > 0 ? whereConditions : undefined,
    orderBy: [{ field: "$createdAt", direction: "desc" }],
    limit,
    offset,
  };

  const [companies, total] = await Promise.all([
    companyModel.findMany(findOptions),
    companyModel.count({
      where: whereConditions.length > 0 ? whereConditions : undefined,
    }),
  ]);

  return {
    companies,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

export async function getCompanyById(companyId: string) {
  try {
    const companyModel = new CompanyAdminModel();
    return await companyModel.findById(companyId);
  } catch (error) {
    console.error("Get company by ID error:", error);
    return null;
  }
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
      const team = await teamsService.createWithId(
        companyId,
        company.companyName,
        ["owner"]
      );

      await companyModel.updateById(
        companyId,
        {
          status: "active",
          approvedBy: ctx.userId,
          approvedAt: new Date().toISOString(),
        },
        [
          Permission.read(Role.team(companyId)),
          Permission.update(Role.team(companyId)),
          Permission.read(Role.label("superadmin")),
          Permission.update(Role.label("superadmin")),
          Permission.delete(Role.label("superadmin")),
        ]
      );

      const userDataModel = new UserDataAdminModel();
      const companyUsers = await userDataModel.findMany({
        where: [{ field: "companyId", operator: "equals", value: companyId }],
      });

      for (const userData of companyUsers) {
        try {
          const roles = userData.role === "owner" ? ["owner"] : ["member"];

          await teamsService.createMembership(
            companyId,
            roles,
            userData.email,
            undefined,
            userData.userId,
            undefined,
            userData.name
          );

          await userDataModel.updateById(userData.$id, {
            companyId: companyId,
            role: userData.role || "member",
          });
        } catch (memberError) {
          console.error(
            `Failed to add user ${userData.email} to team:`,
            memberError
          );
        }
      }

      const ownerUserData = await userDataModel.findByUserId(company.createdBy);

      try {
        if (ownerUserData) {
          await sendCompanyApprovedEmail(
            ownerUserData.email,
            company.companyName,
            ownerUserData.name
          );
        }
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
      }

      revalidatePath("/admin");
      revalidatePath("/admin/companies");
      revalidatePath(`/admin/companies/${companyId}`);

      return {
        success: true,
        message: "Company approved successfully",
        companyId: companyId,
        teamId: team.$id, // This equals companyId
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

      await companyModel.updateById(
        companyId,
        {
          status: "rejected",
          rejectedBy: ctx.userId,
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason,
          currentStep: 2,
        },
        [
          Permission.read(Role.user(company.createdBy)),
          Permission.update(Role.user(company.createdBy)),

          Permission.read(Role.label("superadmin")),
          Permission.update(Role.label("superadmin")),
          Permission.delete(Role.label("superadmin")),
        ]
      );

      const userDataModel = new UserDataAdminModel();
      const userData = await userDataModel.findByUserId(company.createdBy);

      try {
        if (userData) {
          await sendCompanyRejectedEmail(
            userData.email,
            company.companyName,
            reason,
            userData.name
          );
        }
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
      }

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

export const suspendCompanyAction = superAdminAction
  .inputSchema(suspendCompanySchema)
  .action(async ({ parsedInput: { companyId, reason } }) => {
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

      const userDataModel = new UserDataAdminModel();
      const userData = await userDataModel.findByUserId(company.createdBy);

      try {
        if (userData) {
          await sendCompanySuspendedEmail(
            userData.email,
            company.companyName,
            reason,
            userData.name
          );
        }
      } catch (emailError) {
        console.error("Failed to send suspension email:", emailError);
      }

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
  .inputSchema(activateCompanySchema)
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

      const userDataModel = new UserDataAdminModel();
      const userData = await userDataModel.findByUserId(company.createdBy);

      try {
        if (userData) {
          await sendCompanyActivatedEmail(
            userData.email,
            company.companyName,
            userData.name
          );
        }
      } catch (emailError) {
        console.error("Failed to send activation email:", emailError);
      }

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

export const getCompanyDetailsAction = superAdminAction
  .inputSchema(getCompanyDetailsSchema)
  .action(async ({ parsedInput: { companyId } }) => {
    try {
      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findById(companyId);

      if (!company) {
        return { error: "Company not found" };
      }

      const userDataModel = new UserDataAdminModel();
      const creator = await userDataModel.findByUserId(company.createdBy);

      let approver = null;
      if (company.approvedBy) {
        approver = await userDataModel.findByUserId(company.approvedBy);
      }

      return {
        success: true,
        company,
        creator,
        approver,
      };
    } catch (error) {
      console.error("Get company details error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get company details",
      };
    }
  });

export const updateCompanyAction = superAdminAction
  .inputSchema(updateCompanySchema)
  .action(async ({ parsedInput }) => {
    try {
      const { companyId, ...updateData } = parsedInput;

      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findById(companyId);

      if (!company) {
        return { error: "Company not found" };
      }

      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      await companyModel.updateById(companyId, cleanUpdateData);

      revalidatePath("/admin");
      revalidatePath("/admin/companies");
      revalidatePath(`/admin/companies/${companyId}`);

      return {
        success: true,
        message: "Company updated successfully",
      };
    } catch (error) {
      console.error("Update company error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to update company",
      };
    }
  });

export const deleteCompanyAction = superAdminAction
  .inputSchema(deleteCompanySchema)
  .action(async ({ parsedInput: { companyId } }) => {
    try {
      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findById(companyId);

      if (!company) {
        return { error: "Company not found" };
      }

      if (company.status === "active") {
        return {
          error:
            "Cannot delete active companies. Please suspend them first for safety.",
        };
      }

      if (company.teamId) {
        try {
          const teamsService = new AdminTeamsService();
          await teamsService.delete(company.teamId);
        } catch (teamError) {
          console.error("Failed to delete team:", teamError);
        }
      }

      await companyModel.deleteById(companyId);

      revalidatePath("/admin");
      revalidatePath("/admin/companies");

      return {
        success: true,
        message: "Company deleted successfully",
      };
    } catch (error) {
      console.error("Delete company error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to delete company",
      };
    }
  });

export const bulkApproveCompaniesAction = superAdminAction
  .inputSchema(bulkApproveSchema)
  .action(async ({ parsedInput: { companyIds }, ctx }) => {
    try {
      const companyModel = new CompanyAdminModel();
      const teamsService = new AdminTeamsService();
      const userDataModel = new UserDataAdminModel();

      const results = {
        success: [] as string[],
        failed: [] as { id: string; reason: string }[],
      };

      for (const companyId of companyIds) {
        try {
          const company = await companyModel.findById(companyId);

          if (!company) {
            results.failed.push({ id: companyId, reason: "Company not found" });
            continue;
          }

          if (company.status !== "pending") {
            results.failed.push({
              id: companyId,
              reason: "Company is not pending approval",
            });
            continue;
          }

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

          try {
            const userData = await userDataModel.findByUserId(
              company.createdBy
            );
            if (userData) {
              await sendCompanyApprovedEmail(
                userData.email,
                company.companyName,
                userData.name
              );
            }
          } catch (emailError) {
            console.error("Failed to send approval email:", emailError);
          }

          results.success.push(companyId);
        } catch (error) {
          results.failed.push({
            id: companyId,
            reason: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      revalidatePath("/admin");
      revalidatePath("/admin/companies");

      return {
        success: true,
        message: `Approved ${results.success.length} companies. ${results.failed.length} failed.`,
        results,
      };
    } catch (error) {
      console.error("Bulk approve error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to bulk approve companies",
      };
    }
  });

export const bulkRejectCompaniesAction = superAdminAction
  .inputSchema(bulkRejectSchema)
  .action(async ({ parsedInput: { companyIds, reason }, ctx }) => {
    try {
      const companyModel = new CompanyAdminModel();
      const userDataModel = new UserDataAdminModel();

      const results = {
        success: [] as string[],
        failed: [] as { id: string; reason: string }[],
      };

      for (const companyId of companyIds) {
        try {
          const company = await companyModel.findById(companyId);

          if (!company) {
            results.failed.push({ id: companyId, reason: "Company not found" });
            continue;
          }

          if (company.status !== "pending") {
            results.failed.push({
              id: companyId,
              reason: "Company is not pending approval",
            });
            continue;
          }

          await companyModel.updateById(companyId, {
            status: "rejected",
            rejectedBy: ctx.userId,
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason,
          });

          try {
            const userData = await userDataModel.findByUserId(
              company.createdBy
            );
            if (userData) {
              await sendCompanyRejectedEmail(
                userData.email,
                company.companyName,
                reason,
                userData.name
              );
            }
          } catch (emailError) {
            console.error("Failed to send rejection email:", emailError);
          }

          results.success.push(companyId);
        } catch (error) {
          results.failed.push({
            id: companyId,
            reason: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      revalidatePath("/admin");
      revalidatePath("/admin/companies");

      return {
        success: true,
        message: `Rejected ${results.success.length} companies. ${results.failed.length} failed.`,
        results,
      };
    } catch (error) {
      console.error("Bulk reject error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to bulk reject companies",
      };
    }
  });

export const resendNotificationAction = superAdminAction
  .inputSchema(resendNotificationSchema)
  .action(async ({ parsedInput: { companyId, notificationType } }) => {
    try {
      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findById(companyId);

      if (!company) {
        return { error: "Company not found" };
      }

      const userDataModel = new UserDataAdminModel();
      const userData = await userDataModel.findByUserId(company.createdBy);

      if (!userData) {
        return { error: "User data not found" };
      }

      switch (notificationType) {
        case "approval":
          if (company.status !== "active") {
            return { error: "Company must be active to resend approval email" };
          }
          await sendCompanyApprovedEmail(
            userData.email,
            company.companyName,
            userData.name
          );
          break;

        case "rejection":
          if (company.status !== "rejected") {
            return {
              error: "Company must be rejected to resend rejection email",
            };
          }
          await sendCompanyRejectedEmail(
            userData.email,
            company.companyName,
            company.rejectionReason || "No reason provided",
            userData.name
          );
          break;

        case "suspension":
          if (company.status !== "suspended") {
            return {
              error: "Company must be suspended to resend suspension email",
            };
          }
          await sendCompanySuspendedEmail(
            userData.email,
            company.companyName,
            "Account suspended by administrator",
            userData.name
          );
          break;

        case "activation":
          if (company.status !== "active") {
            return {
              error: "Company must be active to resend activation email",
            };
          }
          await sendCompanyActivatedEmail(
            userData.email,
            company.companyName,
            userData.name
          );
          break;

        default:
          return { error: "Invalid notification type" };
      }

      return {
        success: true,
        message: "Notification email sent successfully",
      };
    } catch (error) {
      console.error("Resend notification error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to resend notification",
      };
    }
  });
