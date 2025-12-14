import { z } from "zod";

export const companyBasicInfoSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().min(1, "Please select an industry"),
  size: z.string().min(1, "Please select company size"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  phone: z.string().min(10, "Please enter a valid phone number"),
  description: z.string().optional(),
});

export type CompanyBasicInfoInput = z.infer<typeof companyBasicInfoSchema>;

export const companyAddressSchema = z.object({
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Province is required"),
  country: z.string().min(2, "Country is required"),
  zipCode: z.string().min(3, "ZIP/Postal code is required"),
});

export type CompanyAddressInput = z.infer<typeof companyAddressSchema>;

export const companyBrandingSchema = z.object({
  taxId: z.string().min(5, "Tax ID is required"),
  logoFileId: z.string().optional(),
});

export type CompanyBrandingInput = z.infer<typeof companyBrandingSchema>;

export const uploadDocumentSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, "File must be less than 10MB")
    .refine(
      (file) => ["application/pdf"].includes(file.type),
      "Only PDF files allowed"
    ),
  companyId: z.string().min(1),
});

export const documentsSchema = z.object({
  businessRegistrationFileId: z.string().min(1, "Business registration is required"),
  taxDocumentFileId: z.string().min(1, "Tax document is required"),
  proofOfAddressFileId: z.string().min(1, "Proof of address is required"),
  certificationsFileIds: z.array(z.string()),
});


export type DocumentsInput = z.infer<typeof documentsSchema>;