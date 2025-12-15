
export const COMPANY_ROLES = [
  { value: "ceo", label: "CEO (Chief Executive Officer)" },
  { value: "cto", label: "CTO (Chief Technology Officer)" },
  { value: "cfo", label: "CFO (Chief Financial Officer)" },
  { value: "coo", label: "COO (Chief Operating Officer)" },
  { value: "founder", label: "Founder" },
  { value: "co-founder", label: "Co-Founder" },
  { value: "director", label: "Director" },
  { value: "manager", label: "Manager" },
  { value: "team-lead", label: "Team Lead" },
  { value: "senior-developer", label: "Senior Developer" },
  { value: "developer", label: "Developer" },
  { value: "analyst", label: "Analyst" },
  { value: "consultant", label: "Consultant" },
  { value: "administrator", label: "Administrator" },
  { value: "other", label: "Other" },
] as const;

export type CompanyRoleValue = (typeof COMPANY_ROLES)[number]["value"];

export function getRoleLabel(value: string): string {
  const role = COMPANY_ROLES.find((r) => r.value === value);
  return role?.label || value;
}

export function isValidRole(value: string): boolean {
  return COMPANY_ROLES.some((r) => r.value === value);
}
