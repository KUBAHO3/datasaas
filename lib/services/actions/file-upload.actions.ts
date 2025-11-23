"use server";

import { authAction } from "@/lib/safe-action";
import z from "zod";

export const uploadDocumentFileAction = authAction
  .inputSchema(
    z.object({
      fileName: z.string(),
      fileType: z.string(),
      fileSize: z.number(),
      fileData: z.string(),
    })
  )
  .action(async ({ parsedInput }) => {
    try {
      if (parsedInput.fileType !== "application/pdf") {
        return { error: "Only PDF files are allowed" };
      }

      if (parsedInput.fileSize > 5 * 1024 * 1024) {
        return { error: "File size must be less than 5MB" };
      }
    } catch (error) {}
  });
