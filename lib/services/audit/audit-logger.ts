"use server";

import { CreateAuditLogInput } from "@/lib/types/audit-log-types";

/**
 * Audit Logger Service
 *
 * This is a basic audit logging implementation. For production:
 * 1. Create an AuditLog collection in Appwrite
 * 2. Implement AuditLogModel extending BaseDbModel
 * 3. Add proper indexing on companyId, userId, action, createdAt
 * 4. Add retention policies for log cleanup
 * 5. Consider external logging service (Datadog, Logtail, etc.)
 */
export class AuditLogger {
  /**
   * Log an audit event
   * Currently logs to console. Replace with database writes in production.
   */
  static async log(input: CreateAuditLogInput): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        ...input,
      };

      console.log("[AUDIT LOG]", JSON.stringify(logEntry, null, 2));
    } catch (error) {
      // Don't throw - audit logging failures shouldn't break the application
      console.error("[AUDIT LOG ERROR]", error);
    }
  }

  /**
   * Helper to log company events
   */
  static async logCompanyEvent(params: {
    companyId: string;
    userId: string;
    userName: string;
    userEmail: string;
    action: string;
    metadata?: Record<string, any>;
  }) {
    await this.log({
      companyId: params.companyId,
      userId: params.userId,
      userName: params.userName,
      userEmail: params.userEmail,
      action: params.action as any,
      resourceType: "company",
      resourceId: params.companyId,
      metadata: params.metadata,
    });
  }

  /**
   * Helper to log form events
   */
  static async logFormEvent(params: {
    companyId: string;
    userId: string;
    userName: string;
    userEmail: string;
    action: string;
    formId: string;
    formName?: string;
    metadata?: Record<string, any>;
  }) {
    await this.log({
      companyId: params.companyId,
      userId: params.userId,
      userName: params.userName,
      userEmail: params.userEmail,
      action: params.action as any,
      resourceType: "form",
      resourceId: params.formId,
      resourceName: params.formName,
      metadata: params.metadata,
    });
  }

  /**
   * Helper to log submission events
   */
  static async logSubmissionEvent(params: {
    companyId: string;
    userId: string;
    userName: string;
    userEmail: string;
    action: string;
    submissionId: string;
    metadata?: Record<string, any>;
  }) {
    await this.log({
      companyId: params.companyId,
      userId: params.userId,
      userName: params.userName,
      userEmail: params.userEmail,
      action: params.action as any,
      resourceType: "submission",
      resourceId: params.submissionId,
      metadata: params.metadata,
    });
  }

  /**
   * Helper to log user events
   */
  static async logUserEvent(params: {
    companyId: string;
    userId: string;
    userName: string;
    userEmail: string;
    action: string;
    targetUserId: string;
    targetUserName?: string;
    metadata?: Record<string, any>;
  }) {
    await this.log({
      companyId: params.companyId,
      userId: params.userId,
      userName: params.userName,
      userEmail: params.userEmail,
      action: params.action as any,
      resourceType: "user",
      resourceId: params.targetUserId,
      resourceName: params.targetUserName,
      metadata: params.metadata,
    });
  }
}
