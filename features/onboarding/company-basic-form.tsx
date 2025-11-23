"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyBasicInfoInput, companyBasicInfoSchema } from "@/lib/schemas/onboarding-schemas";
import { saveCompanyBasicInfo } from "@/lib/services/actions/onboarding.actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Building2, Globe, Phone } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const INDUSTRIES = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Retail",
    "Real Estate",
    "Consulting",
    "Other",
];

const COMPANY_SIZES = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1000+ employees",
];

interface CompanyBasicInfoFormProps {
    initialData?: CompanyBasicInfoInput;
}

export function CompanyBasicInfoForm({ initialData }: CompanyBasicInfoFormProps) {
    const router = useRouter();

    const form = useForm<CompanyBasicInfoInput>({
        resolver: zodResolver(companyBasicInfoSchema),
        defaultValues: initialData || {
            companyName: "",
            industry: "",
            size: "",
            website: "",
            phone: "",
            description: "",
        },
    });

    async function onSubmit(data: CompanyBasicInfoInput) {
        try {
            const result = await saveCompanyBasicInfo(data);

            if (result?.data?.success) {
                toast.success("Company information saved!");
                router.push("/onboarding/step-3");
            } else if (result?.serverError) {
                toast.error(result.serverError);
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to save company information");
        }
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Company Basic Information</CardTitle>
                <CardDescription>
                    Tell us about your company
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                            name="companyName"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="name">Company Name *</FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput
                                            {...field}
                                            placeholder="Acme Corporation"
                                            id="companyName"
                                        />
                                        <InputGroupAddon>
                                            <Building2 />
                                        </InputGroupAddon>
                                    </InputGroup>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <div className="grid md:grid-cols-2 gap-4">
                            <Controller
                                name="industry"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="industry">Industry *</FieldLabel>
                                        <select
                                            {...field}
                                            id="industry"
                                            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                                        >
                                            <option value="">Select industry</option>
                                            {INDUSTRIES.map((industry) => (
                                                <option key={industry} value={industry}>
                                                    {industry}
                                                </option>
                                            ))}
                                        </select>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="size"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="size">Company Size *</FieldLabel>
                                        <select
                                            {...field}
                                            id="size"
                                            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                                        >
                                            <option value="">Select size</option>
                                            {COMPANY_SIZES.map((size) => (
                                                <option key={size} value={size}>
                                                    {size}
                                                </option>
                                            ))}
                                        </select>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Controller
                                name="website"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="website">Website (Optional)</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                {...field}
                                                type="url"
                                                placeholder="https://example.com"
                                                id="website"
                                            />
                                            <InputGroupAddon>
                                                <Globe />
                                            </InputGroupAddon>
                                        </InputGroup>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="phone"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="phone">Company Phone *</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                {...field}
                                                type="tel"
                                                placeholder="+1 (555) 123-4567"
                                                id="phone"
                                            />
                                            <InputGroupAddon>
                                                <Phone />
                                            </InputGroupAddon>
                                        </InputGroup>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </div>

                        <Controller
                            name="description"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="description">
                                        Company Description (Optional)
                                    </FieldLabel>
                                    <Textarea
                                        {...field}
                                        id="description"
                                        placeholder="Tell us about your company..."
                                        rows={4}
                                    />
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
                            onClick={() => router.back()}
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