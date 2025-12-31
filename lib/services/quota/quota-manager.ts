"use server";

import { FormAdminModel } from "../models/form.model";
import { SubmissionAdvancedModel } from "../models/submission-advanced.model";
import { UserDataAdminModel } from "../models/users.model";
import { Query } from "node-appwrite";
import { createAdminClient } from "../core/appwrite";
import { DATABASE_ID, FORM_SUBMISSIONS_TABLE_ID } from "@/lib/env-config";

/**
 * Quota Manager Service
 *
 * Basic quota enforcement for companies.
 * For production, add quota limits to Company model and enforce them.
 */

// Default quotas (can be moved to Company model as fields)
export const DEFAULT_QUOTAS = {
  maxForms: 50,
  maxSubmissionsPerForm: 10000,
  maxTotalSubmissions: 100000,
  maxUsers: 25,
  maxStorageGB: 10,
};

export interface QuotaUsage {
  forms: {
    used: number;
    limit: number;
    percentage: number;
  };
  submissions: {
    used: number;
    limit: number;
    percentage: number;
  };
  users: {
    used: number;
    limit: number;
    percentage: number;
  };
  storage: {
    usedGB: number;
    limitGB: number;
    percentage: number;
  };
}

export class QuotaManager {
  /**
   * Check if company can create a new form
   */
  static async canCreateForm(companyId: string): Promise<{ allowed: boolean; message?: string }> {
    try {
      const formModel = new FormAdminModel();
      const forms = await formModel.listByCompany(companyId);

      if (forms.length >= DEFAULT_QUOTAS.maxForms) {
        return {
          allowed: false,
          message: `Form limit reached (${DEFAULT_QUOTAS.maxForms} forms). Upgrade your plan to create more forms.`,
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error("Error checking form quota:", error);
      return { allowed: true }; // Fail open
    }
  }

  /**
   * Check if form can accept new submissions
   */
  static async canCreateSubmission(
    companyId: string,
    formId: string
  ): Promise<{ allowed: boolean; message?: string }> {
    try {
      // Check total submissions for company
      const client = await createAdminClient();
      const totalSubmissions = await client.databases.listDocuments(
        DATABASE_ID,
        FORM_SUBMISSIONS_TABLE_ID,
        [Query.equal("companyId", companyId), Query.limit(1)]
      );

      if (totalSubmissions.total >= DEFAULT_QUOTAS.maxTotalSubmissions) {
        return {
          allowed: false,
          message: `Total submission limit reached (${DEFAULT_QUOTAS.maxTotalSubmissions}). Upgrade your plan.`,
        };
      }

      // Check submissions for this specific form
      const formSubmissions = await client.databases.listDocuments(
        DATABASE_ID,
        FORM_SUBMISSIONS_TABLE_ID,
        [Query.equal("formId", formId), Query.limit(1)]
      );

      if (formSubmissions.total >= DEFAULT_QUOTAS.maxSubmissionsPerForm) {
        return {
          allowed: false,
          message: `Form submission limit reached (${DEFAULT_QUOTAS.maxSubmissionsPerForm} per form).`,
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error("Error checking submission quota:", error);
      return { allowed: true }; // Fail open
    }
  }

  /**
   * Check if company can invite new user
   */
  static async canInviteUser(companyId: string): Promise<{ allowed: boolean; message?: string }> {
    try {
      const userDataModel = new UserDataAdminModel();
      const users = await userDataModel.findMany({
        where: [{ field: "companyId", operator: "equals", value: companyId }],
      });

      if (users.length >= DEFAULT_QUOTAS.maxUsers) {
        return {
          allowed: false,
          message: `User limit reached (${DEFAULT_QUOTAS.maxUsers} users). Upgrade your plan to invite more users.`,
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error("Error checking user quota:", error);
      return { allowed: true }; // Fail open
    }
  }

  /**
   * Get quota usage for a company
   */
  static async getQuotaUsage(companyId: string): Promise<QuotaUsage> {
    try {
      const formModel = new FormAdminModel();
      const userDataModel = new UserDataAdminModel();
      const client = await createAdminClient();

      const [forms, users, submissionsResult] = await Promise.all([
        formModel.listByCompany(companyId),
        userDataModel.findMany({
          where: [{ field: "companyId", operator: "equals", value: companyId }],
        }),
        client.databases.listDocuments(DATABASE_ID, FORM_SUBMISSIONS_TABLE_ID, [
          Query.equal("companyId", companyId),
          Query.limit(1),
        ]),
      ]);

      return {
        forms: {
          used: forms.length,
          limit: DEFAULT_QUOTAS.maxForms,
          percentage: (forms.length / DEFAULT_QUOTAS.maxForms) * 100,
        },
        submissions: {
          used: submissionsResult.total,
          limit: DEFAULT_QUOTAS.maxTotalSubmissions,
          percentage: (submissionsResult.total / DEFAULT_QUOTAS.maxTotalSubmissions) * 100,
        },
        users: {
          used: users.length,
          limit: DEFAULT_QUOTAS.maxUsers,
          percentage: (users.length / DEFAULT_QUOTAS.maxUsers) * 100,
        },
        storage: {
          usedGB: 0, // TODO: Implement storage calculation
          limitGB: DEFAULT_QUOTAS.maxStorageGB,
          percentage: 0,
        },
      };
    } catch (error) {
      console.error("Error getting quota usage:", error);
      return {
        forms: { used: 0, limit: DEFAULT_QUOTAS.maxForms, percentage: 0 },
        submissions: { used: 0, limit: DEFAULT_QUOTAS.maxTotalSubmissions, percentage: 0 },
        users: { used: 0, limit: DEFAULT_QUOTAS.maxUsers, percentage: 0 },
        storage: { usedGB: 0, limitGB: DEFAULT_QUOTAS.maxStorageGB, percentage: 0 },
      };
    }
  }
}
