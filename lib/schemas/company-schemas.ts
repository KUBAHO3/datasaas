import z from "zod";

export const approveCompanySchema = z.object({
  companyId: z.string().min(1),
});

export const rejectCompanySchema = z.object({
  companyId: z.string().min(1),
  reason: z.string().min(10, "Rejection reason must be at least 10 characters"),
});

export const suspendCompanySchema = z.object({
  companyId: z.string().min(1),
  reason: z.string().min(10, "Suspension reason must be at least 10 characters"),
});

export const activateCompanySchema = z.object({
  companyId: z.string().min(1),
});

export const updateCompanySchema = z.object({
  companyId: z.string().min(1),
  companyName: z.string().min(2, "Company name must be at least 2 characters").optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  phone: z.string().optional(),
  description: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
});

export const deleteCompanySchema = z.object({
  companyId: z.string().min(1),
  confirmationText: z.string().refine(
    (val) => val === "DELETE",
    "You must type 'DELETE' to confirm"
  ),
});

export const bulkApproveSchema = z.object({
  companyIds: z.array(z.string()).min(1, "Select at least one company"),
});

export const bulkRejectSchema = z.object({
  companyIds: z.array(z.string()).min(1, "Select at least one company"),
  reason: z.string().min(10, "Rejection reason is required"),
});

export const getCompanyDetailsSchema = z.object({
  companyId: z.string().min(1),
});

export const resendNotificationSchema = z.object({
  companyId: z.string().min(1),
  notificationType: z.enum(["approval", "rejection", "suspension", "activation"]),
});

// Schema for company owners/admins to update their own company profile
export const updateOwnCompanySchema = z.object({
  companyId: z.string().min(1),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().min(1, "Industry is required"),
  size: z.string().min(1, "Company size is required"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
  description: z.string().optional(),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().min(1, "ZIP/Postal code is required"),
});

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type DeleteCompanyInput = z.infer<typeof deleteCompanySchema>;
export type BulkApproveInput = z.infer<typeof bulkApproveSchema>;
export type BulkRejectInput = z.infer<typeof bulkRejectSchema>;
export type ResendNotificationInput = z.infer<typeof resendNotificationSchema>;
export type UpdateOwnCompanyInput = z.infer<typeof updateOwnCompanySchema>;