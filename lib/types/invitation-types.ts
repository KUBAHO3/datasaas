import { Models } from "node-appwrite";

export type InvitationStatus = "pending" | "accepted" | "expired" | "cancelled";

export interface Invitation extends Models.Document {
  email: string;
  name?: string;
  role: "owner" | "admin" | "editor" | "viewer";
  companyId: string;
  companyName: string;
  invitedBy: string;
  inviterName: string;
  token: string;
  expiresAt: string;
  status: InvitationStatus;
}

export interface CreateInvitationData {
  email: string;
  name?: string;
  role: "owner" | "admin" | "editor" | "viewer";
  companyId: string;
  companyName: string;
  invitedBy: string;
  inviterName: string;
  token: string;
  expiresAt: string;
  status: "pending";
}
