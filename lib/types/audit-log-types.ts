export type AuditAction =
  | "company.created"
  | "company.updated"
  | "company.approved"
  | "company.rejected"
  | "company.suspended"
  | "company.activated"
  | "form.created"
  | "form.updated"
  | "form.published"
  | "form.archived"
  | "form.deleted"
  | "form.cloned"
  | "submission.created"
  | "submission.updated"
  | "submission.deleted"
  | "user.invited"
  | "user.joined"
  | "user.removed"
  | "user.role_changed"
  | "user.suspended"
  | "user.activated"
  | "data.imported"
  | "data.exported";

export interface AuditLog {
  $id: string;
  companyId: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: AuditAction;
  resourceType: "company" | "form" | "submission" | "user" | "data";
  resourceId: string;
  resourceName?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface CreateAuditLogInput {
  companyId: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: AuditAction;
  resourceType: "company" | "form" | "submission" | "user" | "data";
  resourceId: string;
  resourceName?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
