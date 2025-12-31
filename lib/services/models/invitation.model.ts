import "server-only";

import { DATABASE_ID, INVITATIONS_TABLE_ID } from "@/lib/env-config";
import { ID, Permission, Role } from "node-appwrite";
import { Invitation, CreateInvitationData } from "@/lib/types/invitation-types";
import { AdminDBModel } from "../core/base-db-model";

export class InvitationAdminModel extends AdminDBModel<Invitation> {
  constructor() {
    super(DATABASE_ID, INVITATIONS_TABLE_ID);
  }

  async create(
    data: Partial<Invitation> | CreateInvitationData,
    documentId?: string,
    permissions?: string[]
  ): Promise<Invitation> {
    const invitationData = data as CreateInvitationData;
    const result = await super.create(
      data as any,
      documentId || ID.unique(),
      permissions || this.getDefaultPermissions(invitationData.companyId)
    );
    return result as Invitation;
  }

  async findById(invitationId: string): Promise<Invitation | null> {
    return super.findById(invitationId) as Promise<Invitation | null>;
  }

  async findByToken(token: string): Promise<Invitation | null> {
    return this.findOne({
      where: [{ field: "token", operator: "equals", value: token }],
    }) as Promise<Invitation | null>;
  }

  async findByEmailAndCompany(
    email: string,
    companyId: string
  ): Promise<Invitation | null> {
    return this.findOne({
      where: [
        { field: "email", operator: "equals", value: email },
        { field: "companyId", operator: "equals", value: companyId },
        { field: "status", operator: "equals", value: "pending" },
      ],
    }) as Promise<Invitation | null>;
  }

  async listByCompany(
    companyId: string,
    status: string = "pending"
  ): Promise<Invitation[]> {
    return this.findMany({
      where: [
        { field: "companyId", operator: "equals", value: companyId },
        { field: "status", operator: "equals", value: status },
      ],
      orderBy: [{ field: "$createdAt", direction: "desc" }],
    }) as Promise<Invitation[]>;
  }

  async listPendingByCompany(companyId: string): Promise<Invitation[]> {
    return this.listByCompany(companyId, "pending");
  }

  async updateStatus(
    invitationId: string,
    status: "pending" | "accepted" | "expired" | "cancelled"
  ): Promise<Invitation> {
    return this.updateById(invitationId, { status }) as Promise<Invitation>;
  }

  async delete(invitationId: string): Promise<void> {
    return this.deleteById(invitationId);
  }

  async markAsAccepted(invitationId: string): Promise<Invitation> {
    return this.updateStatus(invitationId, "accepted");
  }

  async markAsExpired(invitationId: string): Promise<Invitation> {
    return this.updateStatus(invitationId, "expired");
  }

  async markAsCancelled(invitationId: string): Promise<Invitation> {
    return this.updateStatus(invitationId, "cancelled");
  }

  isExpired(invitation: Invitation): boolean {
    return new Date(invitation.expiresAt) < new Date();
  }

  isValid(invitation: Invitation): boolean {
    return invitation.status === "pending" && !this.isExpired(invitation);
  }

  static generateToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Date.now().toString(36)
    );
  }

  static getExpirationDate(days: number = 7): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }

  private getDefaultPermissions(companyId: string): string[] {
    return [
      Permission.read(Role.team(companyId, "owner")),
      Permission.read(Role.team(companyId, "admin")),
      Permission.update(Role.team(companyId, "owner")),
      Permission.update(Role.team(companyId, "admin")),
      Permission.delete(Role.team(companyId, "owner")),
      Permission.delete(Role.team(companyId, "admin")),
    ];
  }
}
