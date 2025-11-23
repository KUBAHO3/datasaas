"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companyAddressSchema, CompanyAddressInput } from "@/lib/schemas/onboarding-schemas";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { MapPin, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveCompanyAddress } from "@/lib/services/actions/onboarding.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";

interface CompanyAddressFormProps {
    initialData?: CompanyAddressInput;
}

export function CompanyAddressForm({ initialData }: CompanyAddressFormProps) {
    const router = useRouter();

    const form = useForm<CompanyAddressInput>({
        resolver: zodResolver(companyAddressSchema),
        defaultValues: initialData || {
            street: "",
            city: "",
            state: "",
            country: "",
            zipCode: "",
        },
    });

    const { execute: saveAddress, isExecuting: isSaving } = useAction(saveCompanyAddress, {
        onSuccess: ({ data }) => {
            if (data?.success) {
                toast.success("Address saved!");
                router.push("/onboarding/step-4");
            } else if (data?.error) {
                toast.error(data.error);
            }
        },
        onError: ({ error }) => {
            toast.error(error.serverError || "Failed to save address");
        },
    });

    function onSubmit(data: CompanyAddressInput) {
        saveAddress(data);
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Company Address</CardTitle>
                <CardDescription>
                    Where is your company located?
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                            name="street"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="street">Street Address *</FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput
                                            {...field}
                                            placeholder="123 Main Street"
                                            id="street"
                                        />
                                        <InputGroupAddon>
                                            <Building />
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
                                name="city"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="city">City *</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                {...field}
                                                placeholder="San Francisco"
                                                id="city"
                                            />
                                            <InputGroupAddon>
                                                <MapPin />
                                            </InputGroupAddon>
                                        </InputGroup>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="state"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="state">State/Province *</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                {...field}
                                                placeholder="California"
                                                id="state"
                                            />
                                        </InputGroup>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Controller
                                name="country"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="country">Country *</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                {...field}
                                                placeholder="United States"
                                                id="country"
                                            />
                                        </InputGroup>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="zipCode"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="zipCode">Zip/Postal Code *</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                {...field}
                                                placeholder="94102"
                                                id="zipCode"
                                            />
                                        </InputGroup>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </div>
                    </FieldGroup>

                    <div className="flex justify-between mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/onboarding/step-2")}
                            disabled={isSaving}
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving..." : "Continue"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}