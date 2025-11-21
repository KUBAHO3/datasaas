import { Models } from "node-appwrite";

export type UserData = Models.Document & {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  role?: string;
  teamId?: string;
  companyId?: string;
};

export type AppwriteUser = Models.User<Models.Preferences>;
