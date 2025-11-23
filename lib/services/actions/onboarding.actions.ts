"use server";

import { AUTH_COOKIE } from "@/lib/constants";
import {
  AdminAccountService,
  SessionAccountService,
} from "../core/base-account";
import {
  OnboardingAdminModel,
  OnboardingSessionModel,
} from "../models/onboarding.model";
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
import { CompanyAdminModel } from "../models/company.model";

export async function getOnboardingProgress() {
  try {
    const cookieStore = await import("next/headers").then((m) => m.cookies());
    const session = cookieStore.get(AUTH_COOKIE);

    if (!session) {
      throw new Error("Not authenticated");
    }

    const sessionAccountService = new SessionAccountService();
    const user = await sessionAccountService.get();

    const onboardingModel = new OnboardingSessionModel();
    let progress = await onboardingModel.findByUserId(user.$id);

    if (!progress) {
      const adminModel = new OnboardingAdminModel();
      progress = await adminModel.createProgress(user.$id);
    }

    return progress;
  } catch (error) {
    throw new Error("Failed to get onboarding progress");
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

      // if (parsedInput.phone) {
      //   await adminUsersService.updatePhone(user.$id, parsedInput.phone);
      // }

      const userDataModel = new UserDataAdminModel();
      await userDataModel.createUserData(user.$id, {
        name: parsedInput.name,
        email: parsedInput.email,
        phone: parsedInput.phone,
        role: parsedInput.jobTitle,
      });

      const onboardingModel = new OnboardingAdminModel();
      await onboardingModel.createProgress(user.$id);

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
      const onboardingModel = new OnboardingAdminModel();

      await onboardingModel.updateProgress(ctx.userId, {
        companyBasicInfo: parsedInput,
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
      const onboardingModel = new OnboardingAdminModel();

      await onboardingModel.updateProgress(ctx.userId, {
        companyAddress: parsedInput,
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
      const onboardingModel = new OnboardingAdminModel();

      await onboardingModel.updateProgress(ctx.userId, {
        companyBranding: parsedInput,
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

export const saveDocuments = authAction
  .schema(documentsSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const onboardingModel = new OnboardingAdminModel();

      await onboardingModel.updateProgress(ctx.userId, {
        documents: parsedInput,
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
    const onboardingModel = new OnboardingAdminModel();
    const progress = await onboardingModel.findByUserId(ctx.userId);

    if (!progress) {
      return { error: "Onboarding progress not found" };
    }

    if (
      !progress.companyBasicInfo ||
      !progress.companyAddress ||
      !progress.companyBranding ||
      !progress.documents
    ) {
      return { error: "Please complete all steps before submitting" };
    }

    const companyModel = new CompanyAdminModel();
    const company = await companyModel.create({
      name: progress.companyBasicInfo.companyName,
      email: ctx.email,
      phone: progress.companyBasicInfo.phone,
      website: progress.companyBasicInfo.website,
      industry: progress.companyBasicInfo.industry,
      size: progress.companyBasicInfo.size,
      description: progress.companyBasicInfo.description,
      address: progress.companyAddress.street,
      city: progress.companyAddress.city,
      state: progress.companyAddress.state,
      country: progress.companyAddress.country,
      zipCode: progress.companyAddress.zipCode,
      logo: progress.companyBranding.logoFileId,
      status: "pending",
      createdBy: ctx.userId,
    });

    await onboardingModel.updateProgress(ctx.userId, {
      status: "submitted",
      companyId: company.$id,
      completedSteps: [1, 2, 3, 4, 5, 6],
    });

    const userDataModel = new UserDataAdminModel();
    await userDataModel.updateById(ctx.userId, {
      companyId: company.$id,
    });

    revalidatePath("/onboarding");
    revalidatePath("/pending-approval");

    return {
      success: true,
      message: "Application submitted successfully",
      companyId: company.$id,
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
    const onboardingModel = new OnboardingAdminModel();
    const progress = await onboardingModel.findByUserId(ctx.userId);

    if (!progress) {
      return { error: "Onboarding progress not found" };
    }

    if (progress.status !== "rejected") {
      return { error: "Can only resubmit rejected applications" };
    }

    if (
      !progress.companyBasicInfo ||
      !progress.companyAddress ||
      !progress.companyBranding ||
      !progress.documents
    ) {
      return { error: "Please complete all steps before resubmitting" };
    }

    const companyModel = new CompanyAdminModel();

    const existingCompany = await companyModel.findOne({
      where: [{ field: "createdBy", operator: "equals", value: ctx.userId }],
    });

    if (!existingCompany) {
      return { error: "Company record not found" };
    }

    await companyModel.updateById(existingCompany.$id, {
      status: "pending",
      rejectedBy: undefined,
      rejectedAt: undefined,
      rejectionReason: undefined,
    });

    await onboardingModel.updateProgress(ctx.userId, {
      status: "submitted",
    });

    revalidatePath("/onboarding");
    revalidatePath("/onboarding/pending-approval");
    revalidatePath("/admin/companies");

    return {
      success: true,
      message: "Application resubmitted successfully",
      companyId: existingCompany.$id,
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
