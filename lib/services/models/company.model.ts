import { COMPANIES_TABLE_ID, DATABASE_ID } from "@/lib/env-config";
import { AdminDBModel, SessionDBModel } from "../core/base-db-model";
import { Company } from "@/lib/types/company-types";

export class CompanySessionModel extends SessionDBModel<Company> {
  constructor() {
    super(DATABASE_ID, COMPANIES_TABLE_ID);
  }
}

export class CompanyAdminModel extends AdminDBModel<Company> {
  constructor() {
    super(DATABASE_ID, COMPANIES_TABLE_ID);
  }

  async getPendingApplications(limit: number = 10) {
    return this.findMany({
      where: [{ field: "status", operator: "equals", value: "pending" }],
      orderBy: [{ field: "$createdAt", direction: "desc" }],
      limit,
    });
  }

  async getStats() {
    const [total, active, pending, suspended] = await Promise.all([
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
    ]);

    return { total, active, pending, suspended };
  }
}
