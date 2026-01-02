import { Models } from "node-appwrite";

export type UserData = Models.Document & {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  jobTitle?: string; // User's actual job title (CEO, Manager, etc.) - for display
  role?: string; // RBAC role (owner, admin, editor, viewer) - for permissions
  teamId?: string;
  companyId?: string;
  suspended?: boolean; // Whether user is suspended
  suspendedAt?: string; // Timestamp when user was suspended
  suspendedBy?: string; // User ID who suspended this user
  suspendedReason?: string; // Optional reason for suspension
};

export type AppwriteUser = Models.User<Models.Preferences>;

// Team member types
export type TeamMemberRole = "owner" | "admin" | "editor" | "viewer";

export interface TeamMember {
  membershipId: string;
  userId: string | null;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  jobTitle?: string;
  role: TeamMemberRole;
  confirmed: boolean;
  invited: string;
  joined?: string; // Optional because pending members haven't joined yet
  suspended?: boolean; // Whether member is suspended
  suspendedAt?: string; // Timestamp when member was suspended
  $createdAt: string;
  $updatedAt: string;
}

export interface TeamMembersData {
  activeMembers: TeamMember[];
  pendingMembers: TeamMember[];
  total: number;
  stats: {
    owners: number;
    admins: number;
    editors: number;
    viewers: number;
  };
}
