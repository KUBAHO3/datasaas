import { Models } from "node-appwrite";

export type Company = Models.Document & {
  companyName: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  size?: string;
  description?: string;
  logo?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  status: "pending" | "active" | "suspended" | "rejected";
  teamId?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdBy: string;
};

export interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  pendingApplications: number;
  suspendedCompanies: number;
  totalUsers: number;
  recentApplications: Company[];
}