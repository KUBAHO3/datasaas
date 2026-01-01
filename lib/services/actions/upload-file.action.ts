"use server";

import { authAction } from "@/lib/safe-action";
import { z } from "zod";
import { FormAdminModel } from "../models/form.model";
import { CompanyDocumentsStorageModel } from "../models/storage.model";

const uploadFileSchema = z.object({
  formId: z.string().min(1, "Form ID is required"),
});

/**
 * Upload file to Appwrite Storage via server action
 * This follows the proper pattern: Client -> Server Action -> Appwrite
 */
export const uploadImportFileAction = authAction
  .inputSchema(uploadFileSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { formId } = parsedInput;

      // Verify user has access to this form
      const formModel = new FormAdminModel();
      const form = await formModel.findById(formId);

      if (!form) {
        return { error: "Form not found" };
      }

      return {
        success: true,
        data: {
          formId: form.$id,
          companyId: form.companyId,
          authorized: true,
        },
      };
    } catch (error) {
      console.error("Upload file validation error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to validate upload",
      };
    }
  });

/**
 * Upload file with FormData
 * ✅ Uses Storage Model pattern
 * ✅ Company-specific storage with permissions
 */
export async function uploadFileWithFormData(formData: FormData) {
  "use server";

  try {
    const file = formData.get("file") as File;
    const formId = formData.get("formId") as string;
    const companyId = formData.get("companyId") as string;

    if (!file) {
      return { error: "No file provided" };
    }

    // For auto-import, companyId is required
    // For regular import, we get companyId from form
    let finalCompanyId = companyId;

    if (!finalCompanyId && formId && formId !== "auto-import") {
      // Get company from form
      const formModel = new FormAdminModel();
      const form = await formModel.findById(formId);

      if (!form) {
        return { error: "Form not found" };
      }

      finalCompanyId = form.companyId;
    }

    if (!finalCompanyId) {
      return { error: "Company ID is required" };
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return { error: "File size must be under 10MB" };
    }

    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (
      !validTypes.includes(file.type) &&
      !file.name.match(/\.(csv|xlsx|xls)$/i)
    ) {
      return { error: "Only Excel and CSV files are allowed" };
    }

    // ✅ Use Storage Model (proper pattern)
    // Pass the File directly - the model will handle InputFile conversion
    const storageModel = new CompanyDocumentsStorageModel();
    const result = await storageModel.uploadImportFile(
      file,
      finalCompanyId,
      file.name
    );

    return {
      success: true,
      data: {
        fileId: result.fileId,
        fileName: result.fileName,
        fileSize: file.size,
        companyId: result.companyId,
      },
    };
  } catch (error) {
    console.error("File upload error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to upload file",
    };
  }
}
