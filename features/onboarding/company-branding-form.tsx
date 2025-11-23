"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companyBrandingSchema, CompanyBrandingInput } from "@/lib/schemas/onboarding-schemas";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveCompanyBranding } from "@/lib/services/actions/onboarding.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CompanyBrandingFormProps {
    initialData?: CompanyBrandingInput;
}

export function CompanyBrandingForm({ initialData }: CompanyBrandingFormProps) {
    const router = useRouter();
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const form = useForm<CompanyBrandingInput>({
        resolver: zodResolver(companyBrandingSchema),
        defaultValues: initialData || {
            taxId: "",
            logoFileId: "",
        },
    });

    async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview the logo
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // In production, upload to Appwrite Storage here
        // const fileId = await uploadToAppwrite(file);
        // form.setValue("logoFileId", fileId);

        toast.success("Logo uploaded successfully!");
    }

    async function onSubmit(data: CompanyBrandingInput) {
        try {
            const result = await saveCompanyBranding(data);

            if (result?.data?.success) {
                toast.success("Branding information saved!");
                router.push("/onboarding/step-5");
            } else if (result?.serverError) {
                toast.error(result.serverError);
            }
        } catch (error) {
            toast.error("Failed to save branding information");
        }
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Company Branding & Tax Information</CardTitle>
                <CardDescription>
                    Upload your logo and provide tax details
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="logo">Company Logo (Optional)</FieldLabel>
                            <FieldDescription>
                                Upload your company logo (JPG, PNG, max 2MB)
                            </FieldDescription>
                            <div className="flex items-center gap-4">
                                {logoPreview && (
                                    <div className="h-20 w-20 rounded-lg border overflow-hidden">
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                                <label className="cursor-pointer">
                                    <div className="flex items-center gap-2 rounded-md border border-input bg-transparent px-4 py-2 text-sm hover:bg-accent">
                                        <Upload className="h-4 w-4" />
                                        <span>Upload Logo</span>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/jpeg,image/png"
                                        onChange={handleLogoUpload}
                                    />
                                </label>
                            </div>
                        </Field>

                        <Controller
                            name="taxId"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="taxId">
                                        Tax ID / Business Registration Number *
                                    </FieldLabel>
                                    <FieldDescription>
                                        Enter your company&apos;s tax identification or business registration number
                                    </FieldDescription>
                                    <InputGroup>
                                        <InputGroupInput
                                            {...field}
                                            placeholder="XX-XXXXXXX"
                                            id="taxId"
                                        />
                                    </InputGroup>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    <div className="flex justify-between mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/onboarding/step-3")}
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? "Saving..." : "Continue"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}