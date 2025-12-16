import { z } from "zod";
import { COMPANY_ROLES } from "@/lib/constants/company-roles";

export const signInFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password must be at most 100 characters."),
});

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  jobTitle: z.enum(
    COMPANY_ROLES.map((role) => role.value) as [string, ...string[]],
    {
      message: "Please select a valid job title", // Changed from errorMap
    }
  ),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be at most 100 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    userId: z.string().min(1, "User ID is required"),
    secret: z.string().min(1, "Recovery secret is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be at most 100 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

// Team member management schemas
export const inviteTeamMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["owner", "admin", "editor", "viewer"], {
    message: "Please select a valid role",
  }),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  companyId: z.string().min(1, "Company ID is required"),
});

export const updateMemberRoleSchema = z.object({
  membershipId: z.string().min(1, "Membership ID is required"),
  companyId: z.string().min(1, "Company ID is required"),
  role: z.enum(["owner", "admin", "editor", "viewer"], {
    message: "Please select a valid role",
  }),
});

export const removeMemberSchema = z.object({
  membershipId: z.string().min(1, "Membership ID is required"),
  companyId: z.string().min(1, "Company ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const resendInvitationSchema = z.object({
  membershipId: z.string().min(1, "Membership ID is required"),
  companyId: z.string().min(1, "Company ID is required"),
  email: z.string().email("Please enter a valid email address"),
});

export const listTeamMembersSchema = z.object({
  companyId: z.string().min(1, "Company ID is required"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type InviteTeamMemberInput = z.infer<typeof inviteTeamMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
export type ResendInvitationInput = z.infer<typeof resendInvitationSchema>;
export type ListTeamMembersInput = z.infer<typeof listTeamMembersSchema>;
