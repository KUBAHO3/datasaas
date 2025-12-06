import { COMPANIES_TABLE_ID, DATABASE_ID } from "@/lib/env-config";
import { AdminDBModel, SessionDBModel } from "../core/base-db-model";
import { Company, CompanyStatus } from "@/lib/types/company-types";
import { AdminTeamsService } from "../core/base-teams";
import { UserDataAdminModel } from "./users.model";
import { Permission, Role } from "node-appwrite";

export class CompanySessionModel extends SessionDBModel<Company> {
  constructor() {
    super(DATABASE_ID, COMPANIES_TABLE_ID);
  }

  async findByUserId(userId: string): Promise<Company | null> {
    return this.findOne({
      where: [{ field: "createdBy", operator: "equals", value: userId }],
    });
  }

  async updateProgress(
    userId: string,
    data: Partial<Company>
  ): Promise<Company> {
    const company = await this.findByUserId(userId);

    if (!company) {
      throw new Error("Company not found for user");
    }

    return this.updateById(company.$id, data);
  }
}

export class CompanyAdminModel extends AdminDBModel<Company> {
  constructor() {
    super(DATABASE_ID, COMPANIES_TABLE_ID);
  }

  async findByUserId(userId: string): Promise<Company | null> {
    return this.findOne({
      where: [{ field: "createdBy", operator: "equals", value: userId }],
    });
  }

  async createDraft(userId: string, email: string): Promise<Company> {
    return this.create(
      {
        createdBy: userId,
        email: email,
        companyName: "",
        currentStep: 2,
        completedSteps: [1],
        status: "draft" as CompanyStatus,
      },
      userId, // Use userId as document ID for easy lookup
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.read(Role.label("superadmin")),
        Permission.update(Role.label("superadmin")),
        Permission.delete(Role.label("superadmin")),
      ]
    );
  }

  async updateProgress(
    userId: string,
    data: Partial<Company>
  ): Promise<Company> {
    return this.updateById(userId, data);
  }

  async submitForApproval(userId: string): Promise<Company> {
    return this.updateById(userId, {
      status: "pending" as CompanyStatus,
      submittedAt: new Date().toISOString(),
      currentStep: 6,
    });
  }

  async getPendingApplications(limit: number = 10) {
    return this.findMany({
      where: [{ field: "status", operator: "equals", value: "pending" }],
      orderBy: [{ field: "$createdAt", direction: "desc" }],
      limit,
    });
  }

  async approveCompany(
    companyId: string,
    adminNotes?: string
  ): Promise<Company> {
    const company = await this.findById(companyId);

    if (!company) {
      throw new Error("Company not found");
    }

    if (company.status !== "pending") {
      throw new Error("Company is not in pending status");
    }

    const teamsService = new AdminTeamsService();

    try {
      const team = await teamsService.createWithId(
        companyId,
        company.companyName,
        ["owner"]
      );

      const updatedCompany = await this.updateById(companyId, {
        status: "approved",
        teamId: team.$id,
        approvedAt: new Date().toISOString(),
        adminNotes: adminNotes || "",
      });

      const userDataModel = new UserDataAdminModel();
      const users = await userDataModel.findMany({
        where: [{ field: "companyId", operator: "equals", value: companyId }],
      });

      for (const user of users) {
        try {
          await teamsService.createMembership(
            team.$id,
            ["member"],
            user.email,
            undefined,
            user.userId,
            undefined,
            user.name
          );

          await userDataModel.updateById(user.$id, {
            teamId: team.$id,
          });
        } catch (error) {
          console.error(`Failed to add user ${user.email} to team:`, error);
        }
      }

      return updatedCompany;
    } catch (error) {
      console.error("Failed to approve company:", error);
      throw new Error("Failed to create team or approve company");
    }
  }

  async validateTeamCompanySync(companyId: string): Promise<boolean> {
    const company = await this.findById(companyId);

    if (!company) {
      throw new Error("Company not found");
    }

    if (company.teamId && company.teamId !== companyId) {
      console.warn(
        `Company ${companyId} has mismatched teamId: ${company.teamId}`
      );
      return false;
    }

    return true;
  }

  async getStats() {
    const [total, active, pending, suspended, draft, rejected] =
      await Promise.all([
        this.count(),
        this.count({
          where: [{ field: "status", operator: "equals", value: "active" }],
        }),
        this.count({
          where: [{ field: "status", operator: "equals", value: "pending" }],
        }),
        this.count({
          where: [{ field: "status", operator: "equals", value: "suspended" }],
        }),
        this.count({
          where: [{ field: "status", operator: "equals", value: "draft" }],
        }),
        this.count({
          where: [{ field: "status", operator: "equals", value: "rejected" }],
        }),
      ]);

    return { total, active, pending, suspended };
  }
}
