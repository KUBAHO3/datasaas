"use server";

import { authAction } from "@/lib/safe-action";
import {
  createFormSchema,
  deleteFormSchema,
  getFormSchema,
  listFormsSchema,
  publishFormSchema,
  updateFormSchema,
} from "@/lib/schemas/form-schemas";
import { CompanyAdminModel } from "../models/company.model";
import { FormAdminModel, FormSessionModel } from "../models/form.model";
import { revalidatePath } from "next/cache";
import { generateFormPermissions } from "@/lib/utils/forms-utils";
import { Permission, Role } from "node-appwrite";

export const createFormAction = authAction
  .inputSchema(createFormSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { name, description } = parsedInput;

      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findByUserId(ctx.userId);

      if (!company) {
        return { error: "Company not found" };
      }

      if (company.status !== "active") {
        return { error: "Your company must be active to create forms" };
      }

      const formModel = new FormAdminModel();
      const form = await formModel.createFormWithDefaults(
        company.$id,
        ctx.userId,
        name,
        description
      );

      revalidatePath(`/org/${company.$id}/forms`);

      return {
        success: true,
        formId: form.$id,
        form,
      };
    } catch (error) {
      console.error("Create form error:", error);
      return {
        error: error instanceof Error ? error.message : "Failed to create form",
      };
    }
  });

export const updateFormAction = authAction
  .schema(updateFormSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { formId, ...updateData } = parsedInput;

      const formModel = new FormAdminModel();
      const existingForm = await formModel.findById(formId);

      if (!existingForm) {
        return { error: "Form not found" };
      }

      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findByUserId(ctx.userId);

      if (!company || company.$id !== existingForm.companyId) {
        return { error: "Unauthorized to update this form" };
      }

      const updatedForm = await formModel.updateById(formId, {
        ...updateData,
        updatedBy: ctx.userId,
      });

      if (updateData.accessControl || updateData.settings) {
        const mergedForm = {
          ...existingForm,
          ...updateData,
          accessControl: updateData.accessControl || existingForm.accessControl,
          settings: updateData.settings || existingForm.settings,
        };

        const newPermissions = generateFormPermissions(
          mergedForm,
          company.$id,
          existingForm.createdBy
        );

        await formModel.updatePermissions(formId, newPermissions);
      }

      revalidatePath(`/org/${company.$id}/forms`);
      revalidatePath(`/org/${company.$id}/forms/${formId}`);

      return {
        success: true,
        form: updatedForm,
      };
    } catch (error) {
      console.error("Update form error:", error);
      return {
        error: error instanceof Error ? error.message : "Failed to update form",
      };
    }
  });

export const publishFormAction = authAction
  .schema(publishFormSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { formId } = parsedInput;

      const formModel = new FormAdminModel();
      const form = await formModel.findById(formId);

      if (!form) {
        return { error: "Form not found" };
      }

      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findByUserId(ctx.userId);

      if (!company || company.$id !== form.companyId) {
        return { error: "Unauthorized to publish this form" };
      }

      if (!form.fields || form.fields.length === 0) {
        return { error: "Form must have at least one field before publishing" };
      }

      const publishedForm = await formModel.updateById(formId, {
        status: "published",
        publishedAt: new Date().toISOString(),
        updatedBy: ctx.userId,
      });

      const permissions = generateFormPermissions(
        publishedForm,
        company.$id,
        form.createdBy
      );

      await formModel.updatePermissions(formId, permissions);

      revalidatePath(`/org/${company.$id}/forms`);
      revalidatePath(`/org/${company.$id}/forms/${formId}`);

      return {
        success: true,
        form: publishedForm,
        message: "Form published successfully!",
      };
    } catch (error) {
      console.error("Publish form error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to publish form",
      };
    }
  });

export const archiveFormAction = authAction
  .schema(publishFormSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { formId } = parsedInput;

      const formModel = new FormAdminModel();
      const form = await formModel.findById(formId);

      if (!form) {
        return { error: "Form not found" };
      }

      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findByUserId(ctx.userId);

      if (!company || company.$id !== form.companyId) {
        return { error: "Unauthorized to archive this form" };
      }

      const archivedForm = await formModel.updateById(formId, {
        status: "archived",
        updatedBy: ctx.userId,
      });

      const permissions = [
        Permission.read(Role.team(company.$id)),
        Permission.update(Role.user(form.createdBy)),
        Permission.update(Role.team(company.$id, "owner")),
        Permission.update(Role.team(company.$id, "admin")),
        Permission.delete(Role.user(form.createdBy)),
        Permission.delete(Role.team(company.$id, "owner")),
        Permission.delete(Role.team(company.$id, "admin")),
      ];

      await formModel.updatePermissions(formId, permissions);

      revalidatePath(`/org/${company.$id}/forms`);
      revalidatePath(`/org/${company.$id}/forms/${formId}`);

      return {
        success: true,
        form: archivedForm,
        message: "Form archived successfully!",
      };
    } catch (error) {
      console.error("Archive form error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to archive form",
      };
    }
  });

export const deleteFormAction = authAction
  .schema(deleteFormSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { formId } = parsedInput;

      const formModel = new FormAdminModel();
      const form = await formModel.findById(formId);

      if (!form) {
        return { error: "Form not found" };
      }

      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findByUserId(ctx.userId);

      if (!company || company.$id !== form.companyId) {
        return { error: "Unauthorized to delete this form" };
      }

      if (form.status !== "draft") {
        return {
          error:
            "Can only delete draft forms. Please archive published forms instead.",
        };
      }

      await formModel.deleteById(formId);

      revalidatePath(`/org/${company.$id}/forms`);

      return {
        success: true,
        message: "Form deleted successfully!",
      };
    } catch (error) {
      console.error("Delete form error:", error);
      return {
        error: error instanceof Error ? error.message : "Failed to delete form",
      };
    }
  });

export const getFormByIdAction = authAction
  .schema(getFormSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { formId } = parsedInput;

      const formModel = new FormSessionModel();
      const form = await formModel.findById(formId);

      if (!form) {
        return { error: "Form not found" };
      }

      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findByUserId(ctx.userId);

      if (!company || company.$id !== form.companyId) {
        return { error: "Unauthorized to view this form" };
      }

      return {
        success: true,
        form,
      };
    } catch (error) {
      console.error("Get form error:", error);
      return {
        error: error instanceof Error ? error.message : "Failed to get form",
      };
    }
  });

export const listFormsAction = authAction
  .schema(listFormsSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { status, limit } = parsedInput;

      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findByUserId(ctx.userId);

      if (!company) {
        return { error: "Company not found" };
      }

      const formModel = new FormSessionModel();
      const forms = await formModel.listByCompany(company.$id, status);

      const limitedForms = limit ? forms.slice(0, limit) : forms;

      return {
        success: true,
        forms: limitedForms,
        total: forms.length,
      };
    } catch (error) {
      console.error("List forms error:", error);
      return {
        error: error instanceof Error ? error.message : "Failed to list forms",
      };
    }
  });
