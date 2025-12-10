"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFormSchema, CreateFormInput } from "@/lib/schemas/form-schemas";
import { createFormAction } from "@/lib/services/actions/form.actions";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface CreateFormCardProps {
    orgId: string;
}

export function CreateFormCard({ orgId }: CreateFormCardProps) {
    const router = useRouter();

    const form = useForm<CreateFormInput>({
        resolver: zodResolver(createFormSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    const { execute: createForm, isExecuting } = useAction(createFormAction, {
        onSuccess: ({ data }) => {
            if (data?.success && data.formId) {
                toast.success("Form created successfully!");
                router.push(`/org/${orgId}/forms/${data.formId}/edit`);
            } else {
                toast.error(data?.error || "Failed to create form");
            }
        },
        onError: ({ error }) => {
            toast.error(error.serverError || "An error occurred");
        },
    });

    function onSubmit(data: CreateFormInput) {
        createForm(data);
    }

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Create New Form</CardTitle>
                <CardDescription>
                    Start building your custom data collection form
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FieldGroup>
                        <FieldLabel htmlFor="name">Form Name</FieldLabel>
                        <Field>
                            <InputGroup>
                                <InputGroupInput
                                    id="name"
                                    placeholder="e.g., Customer Feedback Survey"
                                    {...form.register("name")}
                                />
                            </InputGroup>
                            {form.formState.errors.name && (
                                <FieldError>{form.formState.errors.name.message}</FieldError>
                            )}
                        </Field>
                    </FieldGroup>

                    <FieldGroup>
                        <FieldLabel htmlFor="description">Description (Optional)</FieldLabel>
                        <Field>
                            <Textarea
                                id="description"
                                placeholder="Describe the purpose of this form..."
                                rows={4}
                                {...form.register("description")}
                            />
                            {form.formState.errors.description && (
                                <FieldError>{form.formState.errors.description.message}</FieldError>
                            )}
                        </Field>
                    </FieldGroup>

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isExecuting}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isExecuting} className="flex-1">
                            {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Form
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}