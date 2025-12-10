"use client";

import { FormField } from "@/lib/types/form-types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { toast } from "sonner";

interface FormFieldRendererProps {
    field: FormField;
    index: number;
    showQuestionNumbers: boolean;
    theme: any;
    register: any;
    setValue: any;
    errors: any;
}

export function FormFieldRenderer({
    field,
    index,
    showQuestionNumbers,
    theme,
    register,
    setValue,
    errors,
}: FormFieldRendererProps) {
    const baseStyle = {
        fontFamily: theme.fontFamily,
        fontSize: theme.fontSize,
    };

    const widthClass = {
        full: "w-full",
        half: "w-full md:w-1/2",
        third: "w-full md:w-1/3",
        quarter: "w-full md:w-1/4",
        auto: "w-full m-auto"
    }[field.layout.width];

    return (
        <div className={widthClass}>
            <Label htmlFor={field.id} style={baseStyle} className="mb-2 block">
                {showQuestionNumbers && (
                    <span className="text-muted-foreground mr-2">{index + 1}.</span>
                )}
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>

            {field.description && (
                <p className="text-sm text-muted-foreground mb-2" style={{ fontFamily: theme.fontFamily }}>
                    {field.description}
                </p>
            )}

            <FieldInput field={field} register={register} setValue={setValue} baseStyle={baseStyle} />

            {errors[field.id] && (
                <p className="text-sm text-destructive mt-1">{errors[field.id].message}</p>
            )}
        </div>
    );
}

function FieldInput({
    field,
    register,
    setValue,
    baseStyle,
}: {
    field: any;
    register: any;
    setValue: any;
    baseStyle: any;
}) {
    const validation: any = {
        required: field.required ? `${field.label} is required` : false,
    };

    field.validation.forEach((rule: any) => {
        switch (rule.type) {
            case "min_length":
                validation.minLength = {
                    value: rule.value,
                    message: rule.message,
                };
                break;
            case "max_length":
                validation.maxLength = {
                    value: rule.value,
                    message: rule.message,
                };
                break;
            case "min_value":
                validation.min = {
                    value: rule.value,
                    message: rule.message,
                };
                break;
            case "max_value":
                validation.max = {
                    value: rule.value,
                    message: rule.message,
                };
                break;
            case "email_format":
                validation.pattern = {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: rule.message,
                };
                break;
            case "phone_format":
                validation.pattern = {
                    value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                    message: rule.message,
                };
                break;
        }
    });

    switch (field.type) {
        case "short_text":
        case "url":
            return (
                <Input
                    id={field.id}
                    type="text"
                    placeholder={field.placeholder}
                    style={baseStyle}
                    {...register(field.id, validation)}
                />
            );

        case "email":
            return (
                <Input
                    id={field.id}
                    type="email"
                    placeholder={field.placeholder}
                    style={baseStyle}
                    {...register(field.id, validation)}
                />
            );

        case "phone":
            return (
                <Input
                    id={field.id}
                    type="tel"
                    placeholder={field.placeholder}
                    style={baseStyle}
                    {...register(field.id, validation)}
                />
            );

        case "long_text":
            return (
                <Textarea
                    id={field.id}
                    placeholder={field.placeholder}
                    rows={4}
                    style={baseStyle}
                    {...register(field.id, validation)}
                />
            );

        case "number":
            return (
                <Input
                    id={field.id}
                    type="number"
                    placeholder={field.placeholder}
                    style={baseStyle}
                    {...register(field.id, validation)}
                />
            );

        case "currency":
            return (
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {field.currencySymbol || "$"}
                    </span>
                    <Input
                        id={field.id}
                        type="number"
                        step="0.01"
                        placeholder={field.placeholder}
                        className="pl-8"
                        style={baseStyle}
                        {...register(field.id, validation)}
                    />
                </div>
            );

        case "date":
            return (
                <Input
                    id={field.id}
                    type="date"
                    style={baseStyle}
                    {...register(field.id, validation)}
                />
            );

        case "datetime":
            return (
                <Input
                    id={field.id}
                    type="datetime-local"
                    style={baseStyle}
                    {...register(field.id, validation)}
                />
            );

        case "time":
            return (
                <Input
                    id={field.id}
                    type="time"
                    style={baseStyle}
                    {...register(field.id, validation)}
                />
            );

        case "dropdown":
            return (
                <select
                    id={field.id}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    style={baseStyle}
                    {...register(field.id, validation)}
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
                <RadioGroup
                    onValueChange={(value) => setValue(field.id, value)}
                    {...register(field.id, validation)}
                >
                    <div className="space-y-2">
                        {field.options?.map((option: any) => (
                            <div key={option.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={option.id} />
                                <Label htmlFor={option.id} className="font-normal">
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </RadioGroup>
            );

        case "checkbox":
        case "multi_select":
            return (
                <div className="space-y-2">
                    {field.options?.map((option: any) => (
                        <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={option.id}
                                onCheckedChange={(checked) => {
                                    const currentValues = register(field.id).value || [];
                                    if (checked) {
                                        setValue(field.id, [...currentValues, option.value]);
                                    } else {
                                        setValue(
                                            field.id,
                                            currentValues.filter((v: string) => v !== option.value)
                                        );
                                    }
                                }}
                            />
                            <Label htmlFor={option.id} className="font-normal">
                                {option.label}
                            </Label>
                        </div>
                    ))}
                </div>
            );

        case "rating":
            return (
                <RatingInput
                    maxRating={field.maxRating || 5}
                    icon={field.icon || "star"}
                    onChange={(value) => setValue(field.id, value)}
                    {...register(field.id, validation)}
                />
            );

        case "file_upload":
            return (
                <FileUploadInput
                    fieldId={field.id}
                    maxFiles={field.maxFiles || 1}
                    allowedTypes={field.allowedTypes || []}
                    maxSize={field.maxSize || 10}
                    setValue={setValue}
                />
            );

        default:
            return (
                <div className="text-sm text-muted-foreground">
                    Field type {field.type} not yet implemented
                </div>
            );
    }
}

function RatingInput({
    maxRating,
    icon,
    onChange,
}: {
    maxRating: number;
    icon: string;
    onChange: (value: number) => void;
}) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-2">
            {[...Array(maxRating)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <button
                        key={index}
                        type="button"
                        className="text-2xl transition-colors"
                        onClick={() => {
                            setRating(ratingValue);
                            onChange(ratingValue);
                        }}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                    >
                        {icon === "star" && (
                            <span className={ratingValue <= (hover || rating) ? "text-yellow-400" : "text-gray-300"}>
                                ★
                            </span>
                        )}
                        {icon === "heart" && (
                            <span className={ratingValue <= (hover || rating) ? "text-red-400" : "text-gray-300"}>
                                ♥
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

function FileUploadInput({
    fieldId,
    maxFiles,
    allowedTypes,
    maxSize,
    setValue,
}: {
    fieldId: string;
    maxFiles: number;
    allowedTypes: string[];
    maxSize: number;
    setValue: any;
}) {
    const [files, setFiles] = useState<File[]>([]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedFiles = Array.from(e.target.files || []);

        if (selectedFiles.length > maxFiles) {
            toast.error(`Maximum ${maxFiles} file(s) allowed`);
            return;
        }

        for (const file of selectedFiles) {
            if (file.size > maxSize * 1024 * 1024) {
                toast.error(`File ${file.name} exceeds ${maxSize}MB limit`);
                return;
            }
        }

        setFiles(selectedFiles);
        setValue(fieldId, selectedFiles);
    }

    return (
        <div>
            <Input
                id={fieldId}
                type="file"
                multiple={maxFiles > 1}
                accept={allowedTypes.join(",")}
                onChange={handleFileChange}
            />
            {files.length > 0 && (
                <div className="mt-2 space-y-1">
                    {files.map((file, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                            {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}