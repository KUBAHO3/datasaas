"use client";

import { Form } from "@/lib/types/form-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface FormPreviewProps {
    form: Form;
}

export function FormPreview({ form }: FormPreviewProps) {
    const sortedFields = [...form.fields].sort((a, b) => a.order - b.order);

    return (
        <Card
            className="max-w-3xl mx-auto"
            style={{ backgroundColor: form.theme.backgroundColor }}
        >
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
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
                            <CardDescription
                                className="mt-2"
                                style={{ fontFamily: form.theme.fontFamily }}
                            >
                                {form.description}
                            </CardDescription>
                        )}
                    </div>
                    <Badge variant="outline">Preview Mode</Badge>
                </div>

                {form.theme.showProgressBar && (
                    <div className="mt-4">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full transition-all duration-300"
                                style={{
                                    width: "0%",
                                    backgroundColor: form.theme.primaryColor,
                                }}
                            />
                        </div>
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-6">
                {sortedFields.map((field, index) => (
                    <div key={field.id} className="space-y-2">
                        <Label
                            htmlFor={field.id}
                            style={{
                                fontFamily: form.theme.fontFamily,
                                fontSize: form.theme.fontSize,
                            }}
                        >
                            {form.settings.showQuestionNumbers && (
                                <span className="text-muted-foreground mr-2">{index + 1}.</span>
                            )}
                            {field.label}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>

                        {field.description && (
                            <p
                                className="text-sm text-muted-foreground"
                                style={{ fontFamily: form.theme.fontFamily }}
                            >
                                {field.description}
                            </p>
                        )}

                        <FieldInput field={field} theme={form.theme} />
                    </div>
                ))}

                <div className="pt-4">
                    <Button
                        className="w-full"
                        style={{
                            backgroundColor: form.theme.primaryColor,
                            fontFamily: form.theme.fontFamily,
                        }}
                        disabled
                    >
                        Submit (Preview Only)
                    </Button>
                </div>

                {sortedFields.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No fields added yet</p>
                        <p className="text-sm">Add fields in the form builder to see them here</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function FieldInput({ field, theme }: { field: any; theme: any }) {
    const baseStyle = {
        fontFamily: theme.fontFamily,
        fontSize: theme.fontSize,
    };

    switch (field.type) {
        case "short_text":
        case "email":
        case "phone":
        case "url":
            return (
                <Input
                    id={field.id}
                    type={field.type === "email" ? "email" : "text"}
                    placeholder={field.placeholder}
                    style={baseStyle}
                    disabled
                />
            );

        case "long_text":
            return (
                <Textarea
                    id={field.id}
                    placeholder={field.placeholder}
                    rows={4}
                    style={baseStyle}
                    disabled
                />
            );

        case "number":
        case "currency":
            return (
                <Input
                    id={field.id}
                    type="number"
                    placeholder={field.placeholder}
                    style={baseStyle}
                    disabled
                />
            );

        case "date":
            return <Input id={field.id} type="date" style={baseStyle} disabled />;

        case "datetime":
            return <Input id={field.id} type="datetime-local" style={baseStyle} disabled />;

        case "time":
            return <Input id={field.id} type="time" style={baseStyle} disabled />;

        case "dropdown":
            return (
                <select
                    id={field.id}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    style={baseStyle}
                    disabled
                >
                    <option value="">Select an option...</option>
                    {field.options?.map((option: any) => (
                        <option key={option.id} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );

        case "radio":
            return (
                <div className="space-y-2" style={baseStyle}>
                    {field.options?.map((option: any) => (
                        <div key={option.id} className="flex items-center gap-2">
                            <input type="radio" id={option.id} name={field.id} disabled />
                            <label htmlFor={option.id} className="text-sm">
                                {option.label}
                            </label>
                        </div>
                    ))}
                </div>
            );

        case "checkbox":
        case "multi_select":
            return (
                <div className="space-y-2" style={baseStyle}>
                    {field.options?.map((option: any) => (
                        <div key={option.id} className="flex items-center gap-2">
                            <input type="checkbox" id={option.id} disabled />
                            <label htmlFor={option.id} className="text-sm">
                                {option.label}
                            </label>
                        </div>
                    ))}
                </div>
            );

        case "file_upload":
            return (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                    </p>
                </div>
            );

        default:
            return (
                <div className="text-sm text-muted-foreground">
                    Preview for {field.type} not available
                </div>
            );
    }
}