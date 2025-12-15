"use server";

import { z } from "zod";
import { AUTH_COOKIE } from "@/lib/constants";
import { RBAC_ROLES } from "@/lib/constants/rbac-roles";
import {
  AdminAccountService,
  SessionAccountService,
} from "../core/base-account";
import { AdminUsersService, UserDataAdminModel } from "../models/users.model";
import { signUpSchema } from "@/lib/schemas/user-schema";
import { action, authAction } from "@/lib/safe-action";
import {
  companyAddressSchema,
  companyBasicInfoSchema,
  companyBrandingSchema,
  documentsSchema,
} from "@/lib/schemas/onboarding-schemas";
import { revalidatePath } from "next/cache";
import {
  CompanyAdminModel,
  CompanySessionModel,
} from "../models/company.model";
import { redirect } from "next/navigation";
import { isOnboardingComplete } from "@/lib/utils/company-utis";
import { cookies } from "next/headers";
import { Organization } from "@/lib/types/appwrite.types";

export async function getOnboardingProgress(): Promise<Organization> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(AUTH_COOKIE);

    if (!session) {
      redirect("/auth/sign-in");
    }

    const sessionAccountService = new SessionAccountService();
    const user = await sessionAccountService.get();

    const companyModel = new CompanySessionModel();
    let company = await companyModel.findByUserId(user.$id);

    if (!company) {
      const adminModel = new CompanyAdminModel();
      company = await adminModel.createDraft(user.$id, user.email);
    }

    return company;
  } catch (error) {
    console.error("Failed to get onboarding progress:", error);
    redirect("/auth/sign-in");
  }
}

export const signUpAction = action
  .schema(signUpSchema)
  .action(async ({ parsedInput }) => {
    try {
      const adminUsersService = new AdminUsersService();

      const existingUser = await adminUsersService.existsByEmail(
        parsedInput.email
      );

      if (existingUser) {
        return { error: "User with this email already exists" };
      }

      const user = await adminUsersService.createWithEmail(
        parsedInput.email,
        parsedInput.password,
        parsedInput.name
      );

      const userDataModel = new UserDataAdminModel();
      await userDataModel.createUserData(user.$id, {
        name: parsedInput.name,
        email: parsedInput.email,
        phone: parsedInput.phone,
        jobTitle: parsedInput.jobTitle, // Store job title (CEO, Manager, etc.)
        role: RBAC_ROLES.OWNER, // First user is always the company owner for RBAC
      });

      const companyModel = new CompanyAdminModel();
      await companyModel.createDraft(user.$id, user.email);

      const adminAccountService = new AdminAccountService();
      await adminAccountService.createSession(
        parsedInput.email,
        parsedInput.password
      );

      return {
        success: true,
        message: "Account created successfully",
        userId: user.$id,
      };
    } catch (error) {
      console.error("Sign up error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to create account",
      };
    }
  });

export const saveCompanyBasicInfo = authAction
  .schema(companyBasicInfoSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const companyModel = new CompanyAdminModel();

      await companyModel.updateProgress(ctx.userId, {
        companyName: parsedInput.companyName,
        industry: parsedInput.industry,
        size: parsedInput.size,
        website: parsedInput.website,
        phone: parsedInput.phone,
        description: parsedInput.description,
        currentStep: 3,
        completedSteps: [1, 2],
      });

      revalidatePath("/onboarding");

      return { success: true };
    } catch (error) {
      console.error("Save company basic info error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save company information",
      };
    }
  });

export const saveCompanyAddress = authAction
  .schema(companyAddressSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const companyModel = new CompanyAdminModel();

      await companyModel.updateProgress(ctx.userId, {
        street: parsedInput.street,
        city: parsedInput.city,
        state: parsedInput.state,
        country: parsedInput.country,
        zipCode: parsedInput.zipCode,
        currentStep: 4,
        completedSteps: [1, 2, 3],
      });

      revalidatePath("/onboarding");

      return { success: true };
    } catch (error) {
      console.error("Save company address error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save company address",
      };
    }
  });

export const saveCompanyBranding = authAction
  .schema(companyBrandingSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const companyModel = new CompanyAdminModel();

      await companyModel.updateProgress(ctx.userId, {
        taxId: parsedInput.taxId,
        logoFileId: parsedInput.logoFileId,
        currentStep: 5,
        completedSteps: [1, 2, 3, 4],
      });

      revalidatePath("/onboarding");

      return { success: true };
    } catch (error) {
      console.error("Save company branding error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save branding information",
      };
    }
  });

// ✅ Partial update action for individual file uploads (no validation required)
export const updateDocumentFileId = authAction
  .schema(
    z.object({
      field: z.enum([
        "businessRegistrationFileId",
        "taxDocumentFileId",
        "proofOfAddressFileId",
      ]),
      fileId: z.string().min(1),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    try {
      const companyModel = new CompanyAdminModel();

      await companyModel.updateProgress(ctx.userId, {
        [parsedInput.field]: parsedInput.fileId,
      });

      revalidatePath("/onboarding");

      return { success: true };
    } catch (error) {
      console.error("Update document file ID error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update document file ID",
      };
    }
  });

// ✅ Update certifications file IDs
export const updateCertificationFileIds = authAction
  .schema(
    z.object({
      fileIds: z.array(z.string()),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    try {
      const companyModel = new CompanyAdminModel();

      await companyModel.updateProgress(ctx.userId, {
        certificationsFileIds: parsedInput.fileIds,
      });

      revalidatePath("/onboarding");

      return { success: true };
    } catch (error) {
      console.error("Update certification file IDs error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update certification file IDs",
      };
    }
  });

// ✅ Clear document file ID from database
export const clearDocumentFileId = authAction
  .schema(
    z.object({
      field: z.enum([
        "businessRegistrationFileId",
        "taxDocumentFileId",
        "proofOfAddressFileId",
      ]),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    try {
      const companyModel = new CompanyAdminModel();

      await companyModel.updateProgress(ctx.userId, {
        [parsedInput.field]: "",
      });

      revalidatePath("/onboarding");

      return { success: true };
    } catch (error) {
      console.error("Clear document file ID error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to clear document file ID",
      };
    }
  });

export const saveDocuments = authAction
  .schema(documentsSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const companyModel = new CompanyAdminModel();

      await companyModel.updateProgress(ctx.userId, {
        businessRegistrationFileId: parsedInput.businessRegistrationFileId,
        taxDocumentFileId: parsedInput.taxDocumentFileId,
        proofOfAddressFileId: parsedInput.proofOfAddressFileId,
        certificationsFileIds: parsedInput.certificationsFileIds,
        currentStep: 6,
        completedSteps: [1, 2, 3, 4, 5],
      });

      revalidatePath("/onboarding");

      return { success: true };
    } catch (error) {
      console.error("Save documents error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to save documents",
      };
    }
  });

export const submitOnboarding = authAction.action(async ({ ctx }) => {
  try {
    const companyModel = new CompanyAdminModel();
    const company = await companyModel.findByUserId(ctx.userId);

    if (!company) {
      return { error: "Company not found" };
    }

    if (!isOnboardingComplete(company)) {
      return { error: "Please complete all steps before submitting" };
    }

    if (company.status === "pending") {
      return { error: "Application already submitted" };
    }

    const updatedCompany = await companyModel.submitForApproval(ctx.userId);

    const userDataModel = new UserDataAdminModel();
    const userData = await userDataModel.findByUserId(ctx.userId);
    if (userData) {
      await userDataModel.updateById(userData.$id, {
        companyId: updatedCompany.$id,
      });
    }

    revalidatePath("/onboarding");
    revalidatePath("/onboarding/pending-approval");
    revalidatePath("/admin");
    revalidatePath("/admin/companies");

    return {
      success: true,
      message: "Application submitted successfully",
      companyId: updatedCompany.$id,
    };
  } catch (error) {
    console.error("Submit onboarding error:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to submit application",
    };
  }
});

export const resubmitOnboarding = authAction.action(async ({ ctx }) => {
  try {
    const companyModel = new CompanyAdminModel();
    const company = await companyModel.findByUserId(ctx.userId);

    if (!company) {
      return { error: "Onboarding progress not found" };
    }

    if (company.status !== "rejected") {
      return { error: "Only rejected applications can be resubmitted" };
    }

    if (!company.companyId) {
      return { error: "No company found for resubmission" };
    }

    await companyModel.updateById(company.companyId, {
      status: "pending",
      rejectedBy: undefined,
      rejectedAt: undefined,
      rejectionReason: undefined,
    });

    await company.updateProgress(ctx.userId, {
      status: "submitted",
      rejectionReason: undefined,
    });

    revalidatePath("/onboarding");
    revalidatePath("/onboarding/pending-approval");
    revalidatePath("/admin");
    revalidatePath("/admin/companies");

    return {
      success: true,
      message: "Application resubmitted successfully",
    };
  } catch (error) {
    console.error("Resubmit onboarding error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to resubmit application",
    };
  }
});
