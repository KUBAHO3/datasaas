"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companyBrandingSchema, CompanyBrandingInput } from "@/lib/schemas/onboarding-schemas";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { saveCompanyBranding } from "@/lib/services/actions/onboarding.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUploader } from "@/components/upload/image-uploader";
import { uploadImage } from "@/lib/services/actions/file-upload.actions";
import { Loader2 } from "lucide-react";

interface CompanyBrandingFormProps {
    initialData?: CompanyBrandingInput;
    companyId?: string;
}

export function CompanyBrandingForm({ initialData, companyId }: CompanyBrandingFormProps) {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const form = useForm<CompanyBrandingInput>({
        resolver: zodResolver(companyBrandingSchema),
        defaultValues: initialData || {
            taxId: "",
            logoFileId: "",
        },
    });

    async function handleLogoChange(file: File | null) {
        setLogoFile(file);

        if (file) {
            setIsUploading(true);
            try {
                const result = await uploadImage({ file, companyId });

                if (result?.data?.success) {
                    form.setValue("logoFileId", result.data.fileId);
                    toast.success("Logo uploaded successfully!");
                } else {
                    toast.error(result?.data?.error || "Failed to upload logo");
                    setLogoFile(null);
                }
            } catch (error) {
                console.error("Logo upload error:", error);
                toast.error("Failed to upload logo");
                setLogoFile(null);
            } finally {
                setIsUploading(false);
            }
        } else {
            form.setValue("logoFileId", "");
        }
    }

    async function onSubmit(data: CompanyBrandingInput) {
        try {
            const result = await saveCompanyBranding(data);

            if (result?.data?.success) {
                toast.success("Branding information saved!");
                router.push("/onboarding?step=5");
            } else {
                toast.error(result?.data?.error || "Failed to save branding information");
            }
        } catch (error) {
            console.error("Save branding error:", error);
            toast.error("An unexpected error occurred");
        }
    }

    const isSubmitting = form.formState.isSubmitting;

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Company Branding</CardTitle>
                <CardDescription>
                    Upload your company logo and provide tax information
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="taxId">
                                Tax ID / EIN
                            </FieldLabel>
                            <FieldDescription>
                                Your company's tax identification number
                            </FieldDescription>
                            <InputGroup>
                                <InputGroupInput
                                    id="taxId"
                                    placeholder="XX-XXXXXXX"
                                    {...form.register("taxId")}
                                />
                            </InputGroup>
                            {form.formState.errors.taxId && (
                                <FieldError>{form.formState.errors.taxId.message}</FieldError>
                            )}
                        </Field>
                    </FieldGroup>

                    <FieldGroup>
                        <Field>
                            <FieldLabel>Company Logo (Optional)</FieldLabel>
                            <FieldDescription>
                                Upload your company logo (PNG, JPG, GIF, SVG - max 5MB)
                            </FieldDescription>
                            <ImageUploader
                                file={logoFile}
                                onChange={handleLogoChange}
                                imageWidth={200}
                                imageHeight={200}
                                disabled={isUploading}
                            />
                            {form.formState.errors.logoFileId && (
                                <FieldError>{form.formState.errors.logoFileId.message}</FieldError>
                            )}
                        </Field>
                    </FieldGroup>

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/onboarding?step=3")}
                            disabled={isSubmitting || isUploading}
                            className="flex-1"
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || isUploading}
                            className="flex-1"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Continue"
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}