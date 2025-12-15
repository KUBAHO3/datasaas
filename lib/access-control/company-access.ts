"use server";

import { cache } from "react";
import { CompanyAdminModel } from "../services/models/company.model";
import { UserDataAdminModel } from "../services/models/users.model";

export const getCompanyStatus = cache(async (companyId: string) => {
  try {
    const companyModel = new CompanyAdminModel();
    const company = await companyModel.findById(companyId);

    if (!company) {
      return { status: null, company: null };
    }

    return {
      status: company.status,
      company: {
        id: company.$id,
        name: company.companyName,
        status: company.status,
      },
    };
  } catch (error) {
    console.error("Error fetching company status:", error);
    return { status: null, company: null };
  }
});

export const checkCompanySuspension = cache(
  async (userId: string, isSuperAdmin: boolean) => {
    if (isSuperAdmin) {
      return { isSuspended: false, company: null };
    }

    try {
      const userDataModel = new UserDataAdminModel();
      const userData = await userDataModel.findByUserId(userId);

      if (!userData?.companyId) {
        return { isSuspended: false, company: null };
      }

      const { status, company } = await getCompanyStatus(userData.companyId);

      if (status === "suspended") {
        return { isSuspended: true, company };
      }

      return { isSuspended: false, company };
    } catch (error) {
      console.error("Error checking company suspension:", error);
      return { isSuspended: false, company: null };
    }
  }
);

export const getUserCompanyWithStatus = cache(async (userId: string) => {
  try {
    const userDataModel = new UserDataAdminModel();
    const userData = await userDataModel.findByUserId(userId);

    if (!userData?.companyId) {
      return null;
    }

    const companyModel = new CompanyAdminModel();
    const company = await companyModel.findById(userData.companyId);

    return company;
  } catch (error) {
    console.error("Error fetching user company:", error);
    return null;
  }
});

export interface CompanyAccessResult {
  hasAccess: boolean;
  reason?: "suspended" | "not-found" | "no-company";
  companyName?: string;
  companyStatus?: string;
}

export const checkCompanyAccess = cache(
  async (userId: string, isSuperAdmin: boolean): Promise<CompanyAccessResult> => {
    if (isSuperAdmin) {
      return { hasAccess: true };
    }

    const { isSuspended, company } = await checkCompanySuspension(
      userId,
      isSuperAdmin
    );

    if (isSuspended && company) {
      return {
        hasAccess: false,
        reason: "suspended",
        companyName: company.name,
        companyStatus: company.status,
      };
    }

    return { hasAccess: true };
  }
);
