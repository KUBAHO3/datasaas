import z from "zod";

export const approveCompanySchema = z.object({
  companyId: z.string().min(1),
});

export const rejectCompanySchema = z.object({
  companyId: z.string().min(1),
  reason: z.string().min(1, "Rejection reason is required"),
});

export const suspendCompanySchema = z.object({
  companyId: z.string().min(1),
});

export const activateCompanySchema = z.object({
  companyId: z.string().min(1),
});
