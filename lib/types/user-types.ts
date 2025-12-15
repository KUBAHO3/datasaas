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
};

export type AppwriteUser = Models.User<Models.Preferences>;
