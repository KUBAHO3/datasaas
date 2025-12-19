"use client";

import { useState, useEffect } from "react";
import { Form, FormField } from "@/lib/types/form-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { createSubmissionAction, createPublicSubmissionAction, updateSubmissionAction } from "@/lib/services/actions/form-submission.actions";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { FormFieldRenderer } from "./form-field-renderer";

interface FormRendererProps {
    form: Form;
    userContext: any;
}

export function FormRenderer({ form, userContext }: FormRendererProps) {
    // Determine if the form is public
    const isPublicForm =
        form.settings?.isPublic ||
        form.settings?.allowAnonymous ||
        form.accessControl?.isPublic ||
        form.accessControl?.visibility === "public";

    // Use the appropriate action based on whether it's a public form
    const submissionAction = isPublicForm ? createPublicSubmissionAction : createSubmissionAction;
    const [submissionId, setSubmissionId] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const formMethods = useForm<Record<string, any>>({
        mode: "onChange",
        defaultValues: {},
    });

    const totalSteps = form.steps.length;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const currentStepFields = (() => {
        const stepFieldIds = form.steps[currentStep]?.fields || [];

        if (stepFieldIds.length > 0) {
            return form.fields
                .filter((field) => stepFieldIds.includes(field.id))
                .sort((a, b) => a.order - b.order);
        }

        const allAssignedFieldIds = form.steps.flatMap((step) => step.fields || []);

        if (allAssignedFieldIds.length === 0 && currentStep === 0) {
            return form.fields.sort((a, b) => a.order - b.order);
        }

        return form.fields
            .filter((field) => !allAssignedFieldIds.includes(field.id))
            .sort((a, b) => a.order - b.order);
    })();

    useEffect(() => {
        if (!form.settings.enableAutoSave || isSubmitted) return;

        const interval = setInterval(() => {
            // Only save draft if user has entered some data
            const formData = formMethods.getValues();
            const hasData = Object.keys(formData).some(key => {
                const value = formData[key];
                return value !== undefined && value !== null && value !== '';
            });

            if (hasData) {
                saveDraft();
            }
        }, form.settings.autoSaveInterval * 1000);

        return () => clearInterval(interval);
    }, [form.settings.enableAutoSave, isSubmitted, submissionId]);

    const { execute: createSubmission } = useAction(submissionAction, {
        onSuccess: ({ data }) => {
            if (data?.success && data.submissionId) {
                setSubmissionId(data.submissionId);
            }
        },
    });

    const { execute: updateSubmission } = useAction(updateSubmissionAction);

    const { execute: submitForm, isExecuting: isSubmitting } = useAction(
        submissionAction,
        {
            onSuccess: ({ data }) => {
                if (data?.success) {
                    setIsSubmitted(true);
                    toast.success("Form submitted successfully!");

                    if (form.settings.redirectUrl) {
                        setTimeout(() => {
                            window.location.href = form.settings.redirectUrl!;
                        }, 2000);
                    }
                } else {
                    toast.error(data?.error || "Failed to submit form");
                }
            },
        }
    );

    function saveDraft() {
        const formData = formMethods.getValues();

        if (submissionId) {
            updateSubmission({
                submissionId,
                data: formData,
                status: "draft",
            });
        } else {
            createSubmission({
                formId: form.$id,
                data: formData,
                status: "draft",
                isAnonymous: !userContext,
            });
        }
    }

    function validateCurrentStep(): boolean {
        const errors = formMethods.formState.errors as Record<string, any>;

        for (const field of currentStepFields) {
            if (field.required) {
                const value = formMethods.getValues(field.id);
                if (!value || errors[field.id]) {
                    toast.error(`Please fill in all required fields`);
                    return false;
                }
            }
        }

        return true;
    }

    function handleNext() {
        if (!validateCurrentStep()) return;

        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);

            // Only save draft if user has entered some data
            const formData = formMethods.getValues();
            const hasData = Object.keys(formData).some(key => {
                const value = formData[key];
                return value !== undefined && value !== null && value !== '';
            });

            if (hasData && form.settings.enableAutoSave) {
                saveDraft();
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function handlePrevious() {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function onSubmit(data: any) {
        console.log("daaaattttaaa: ", data)
        if (!validateCurrentStep()) return;

        submitForm({
            formId: form.$id,
            data,
            status: "completed",
            submittedByEmail: data.email,
            isAnonymous: !userContext,
        });
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: form.theme.backgroundColor }}>
                <Card className="max-w-2xl w-full">
                    <CardContent className="pt-12 pb-12 text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">
                            {form.settings.confirmationMessage}
                        </h2>
                        <p className="text-muted-foreground">
                            Your response has been recorded. Thank you!
                        </p>
                        {form.settings.redirectUrl && (
                            <p className="text-sm text-muted-foreground mt-4">
                                Redirecting you in a moment...
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4" style={{ backgroundColor: form.theme.backgroundColor }}>
            <form onSubmit={formMethods.handleSubmit(onSubmit)} className="max-w-3xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle
                            className="text-3xl"
                            style={{
                                color: form.theme.primaryColor,
                                fontFamily: form.theme.fontFamily,
                            }}
                        >
                            {form.name}
                        </CardTitle>
                        {form.description && (
                            <CardDescription style={{ fontFamily: form.theme.fontFamily }}>
                                {form.description}
                            </CardDescription>
                        )}

                        {form.theme.showProgressBar && totalSteps > 1 && (
                            <div className="mt-4">
                                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                    <span>
                                        Step {currentStep + 1} of {totalSteps}
                                    </span>
                                    <span>{Math.round(progress)}% Complete</span>
                                </div>
                                <Progress value={progress} />
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Current Step Title */}
                        {form.steps[currentStep]?.title && totalSteps > 1 && (
                            <div>
                                <h3 className="text-xl font-semibold">
                                    {form.steps[currentStep].title}
                                </h3>
                                {form.steps[currentStep].description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {form.steps[currentStep].description}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Render Fields */}
                        <div className="space-y-6">
                            {currentStepFields.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No fields in this step</p>
                                </div>
                            ) : (
                                currentStepFields.map((field, index) => (
                                    <FormFieldRenderer
                                        key={field.id}
                                        field={field}
                                        index={index}
                                        showQuestionNumbers={form.settings.showQuestionNumbers}
                                        theme={form.theme}
                                        register={formMethods.register}
                                        setValue={formMethods.setValue}
                                        errors={formMethods.formState.errors}
                                    />
                                ))
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 pt-4">
                            {currentStep > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePrevious}
                                    className="flex-1"
                                    style={{
                                        borderRadius:
                                            form.theme.buttonStyle === "pill"
                                                ? "9999px"
                                                : form.theme.buttonStyle === "rounded"
                                                    ? "0.375rem"
                                                    : "0",
                                    }}
                                >
                                    Previous
                                </Button>
                            )}

                            {currentStep < totalSteps - 1 ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex-1"
                                    style={{
                                        backgroundColor: form.theme.primaryColor,
                                        borderRadius:
                                            form.theme.buttonStyle === "pill"
                                                ? "9999px"
                                                : form.theme.buttonStyle === "rounded"
                                                    ? "0.375rem"
                                                    : "0",
                                    }}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1"
                                    style={{
                                        backgroundColor: form.theme.primaryColor,
                                        borderRadius:
                                            form.theme.buttonStyle === "pill"
                                                ? "9999px"
                                                : form.theme.buttonStyle === "rounded"
                                                    ? "0.375rem"
                                                    : "0",
                                    }}
                                >
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit
                                </Button>
                            )}
                        </div>

                        {/* Auto-save indicator */}
                        {form.settings.enableAutoSave && (
                            <p className="text-xs text-center text-muted-foreground">
                                Your progress is automatically saved
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Branding Footer */}
                <div className="text-center mt-6 text-sm text-muted-foreground">
                    Powered by <span className="font-semibold">DataSaaS</span>
                </div>
            </form>
        </div>
    );
}