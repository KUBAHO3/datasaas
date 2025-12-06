import { Company } from "../types/company-types";

export function canEditCompany(company: Company): boolean {
  return company.status === "draft" || company.status === "rejected";
}

export function isCompanyLive(company: Company): boolean {
  return company.status === "active";
}

export function needsApproval(company: Company): boolean {
  return company.status === "pending";
}

export function isOnboardingComplete(company: Company): boolean {
  return (
    company.completedSteps.length === 5 &&
    !!company.companyName &&
    !!company.industry &&
    !!company.size &&
    !!company.phone &&
    !!company.email &&
    !!company.street &&
    !!company.city &&
    !!company.state &&
    !!company.country &&
    !!company.zipCode &&
    !!company.taxId &&
    !!company.businessRegistrationFileId &&
    !!company.taxDocumentFileId &&
    !!company.proofOfAddressFileId
  );
}

export interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  pendingApplications: number;
  suspendedCompanies: number;
  draftCompanies: number;
  rejectedCompanies: number;
  totalUsers: number;
  recentApplications: Company[];
}
