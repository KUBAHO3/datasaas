export interface Invitation {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  email: string;
  name?: string;
  role: "owner" | "admin" | "editor" | "viewer";
  companyId: string;
  companyName: string;
  invitedBy: string;
  inviterName: string;
  token: string; // Unique token for accepting invitation
  expiresAt: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
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
