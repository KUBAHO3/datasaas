import { z } from "zod";

export const updateUserProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  avatar: z.string().optional(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
