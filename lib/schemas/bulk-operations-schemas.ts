import { z } from "zod";

export const bulkDeleteSubmissionsSchema = z.object({
  submissionIds: z.array(z.string()).min(1, "Select at least one submission"),
  confirmDelete: z.literal(true, "You must confirm deletion"),
});

export type BulkDeleteSubmissionsInput = z.infer<typeof bulkDeleteSubmissionsSchema>;

export const bulkDeleteFormsSchema = z.object({
  formIds: z.array(z.string()).min(1, "Select at least one form"),
  confirmDelete: z.literal(true, "You must confirm deletion"),
});

export type BulkDeleteFormsInput = z.infer<typeof bulkDeleteFormsSchema>;
