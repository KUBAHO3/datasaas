import "server-only";
import { createAdminClient } from "../core/appwrite";
import { DATABASE_ID, INVITATIONS_TABLE_ID } from "@/lib/env-config";
import { ID, Query } from "node-appwrite";
import { Invitation, CreateInvitationData } from "@/lib/types/invitation-types";

export class InvitationModel {
  private async getDatabase() {
    const client = await createAdminClient();
    return client.database;
  }

  /**
   * Create a new invitation
   */
  async create(data: CreateInvitationData): Promise<Invitation> {
    const db = await this.getDatabase();

    const invitation = await db.createDocument<Invitation>(
      DATABASE_ID,
      INVITATIONS_TABLE_ID,
      ID.unique(),
      data
    );

    return invitation;
  }

  /**
   * Find invitation by ID
   */
  async findById(invitationId: string): Promise<Invitation | null> {
    try {
      const db = await this.getDatabase();

      const invitation = await db.getDocument<Invitation>(
        DATABASE_ID,
        INVITATIONS_TABLE_ID,
        invitationId
      );

      return invitation;
    } catch (error) {
      console.error("Find invitation by ID error:", error);
      return null;
    }
  }

  /**
   * Find invitation by token
   */
  async findByToken(token: string): Promise<Invitation | null> {
    try {
      const db = await this.getDatabase();

      const response = await db.listDocuments<Invitation>(
        DATABASE_ID,
        INVITATIONS_TABLE_ID,
        [Query.equal("token", token), Query.limit(1)]
      );

      return response.documents[0] || null;
    } catch (error) {
      console.error("Find invitation by token error:", error);
      return null;
    }
  }

  /**
   * Find invitation by email and company
   */
  async findByEmailAndCompany(
    email: string,
    companyId: string
  ): Promise<Invitation | null> {
    try {
      const db = await this.getDatabase();

      const response = await db.listDocuments<Invitation>(
        DATABASE_ID,
        INVITATIONS_TABLE_ID,
        [
          Query.equal("email", email),
          Query.equal("companyId", companyId),
          Query.equal("status", "pending"),
          Query.limit(1),
        ]
      );

      return response.documents[0] || null;
    } catch (error) {
      console.error("Find invitation by email and company error:", error);
      return null;
    }
  }

  /**
   * List all pending invitations for a company
   */
  async listByCompany(companyId: string, status: string = "pending") {
    try {
      const db = await this.getDatabase();

      const response = await db.listDocuments<Invitation>(
        DATABASE_ID,
        INVITATIONS_TABLE_ID,
        [
          Query.equal("companyId", companyId),
          Query.equal("status", status),
          Query.orderDesc("$createdAt"),
        ]
      );

      return response.documents;
    } catch (error) {
      console.error("List invitations by company error:", error);
      return [];
    }
  }

  /**
   * Update invitation status
   */
  async updateStatus(
    invitationId: string,
    status: "pending" | "accepted" | "expired" | "cancelled"
  ): Promise<Invitation> {
    const db = await this.getDatabase();

    const invitation = await db.updateDocument<Invitation>(
      DATABASE_ID,
      INVITATIONS_TABLE_ID,
      invitationId,
      { status }
    );

    return invitation;
  }

  /**
   * Delete invitation
   */
  async delete(invitationId: string): Promise<void> {
    const db = await this.getDatabase();

    await db.deleteDocument(DATABASE_ID, INVITATIONS_TABLE_ID, invitationId);
  }

  /**
   * Check if invitation is expired
   */
  isExpired(invitation: Invitation): boolean {
    return new Date(invitation.expiresAt) < new Date();
  }

  /**
   * Generate invitation token
   */
  static generateToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Date.now().toString(36)
    );
  }

  /**
   * Calculate expiration date (7 days from now)
   */
  static getExpirationDate(days: number = 7): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }
}
