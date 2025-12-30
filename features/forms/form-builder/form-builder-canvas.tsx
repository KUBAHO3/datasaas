"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField } from "@/lib/types/form-types";
import { cn } from "@/lib/utils";
import { createDefaultField } from "@/lib/utils/forms-utils";
import { GripVertical, Plus, Settings, Trash2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { FieldConfigDialog } from "./field-config-dialog";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FormBuilderCanvasProps {
    form: Form;
    updateForm: (updates: Partial<Form>) => void;
}

export function FormBuilderCanvas({ form, updateForm }: FormBuilderCanvasProps) {
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [selectedField, setSelectedField] = useState<FormField | null>(null);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    function handleDragOver(e: React.DragEvent, index: number) {
        e.preventDefault();
        setDragOverIndex(index);
    }

    function handleDrop(e: React.DragEvent, index: number) {
        e.preventDefault();
        setDragOverIndex(null);

        const fieldType = e.dataTransfer.getData("fieldType");
        if (!fieldType) return;

        const newField = createDefaultField(fieldType, form.fields.length + 1);
        const newFields = [...form.fields];
        newFields.splice(index, 0, newField);

        newFields.forEach((field, i) => {
            field.order = i + 1;
        });

        updateForm({ fields: newFields });
    }

    function handleFieldDelete(fieldId: string) {
        const newFields = form.fields.filter((f) => f.id !== fieldId);
        newFields.forEach((field, i) => {
            field.order = i + 1;
        });
        updateForm({ fields: newFields });
    }

    function handleFieldUpdate(updatedField: FormField) {
        const newFields = form.fields.map((f) =>
            f.id === updatedField.id ? updatedField : f
        );
        updateForm({ fields: newFields });
        setSelectedField(null);
        setIsConfigOpen(false);
    }

    function handleFieldConfig(field: FormField) {
        setSelectedField(field);
        setIsConfigOpen(true);
    }

    return (
        <div className="flex-1 overflow-auto bg-muted/20">
            <div className="max-w-3xl mx-auto p-3 sm:p-4 md:p-6 space-y-3 md:space-y-4">
                <DropZone
                    isOver={dragOverIndex === 0}
                    onDragOver={(e) => handleDragOver(e, 0)}
                    onDrop={(e) => handleDrop(e, 0)}
                    isEmpty={form.fields.length === 0}
                />

                {form.fields
                    .sort((a, b) => a.order - b.order)
                    .map((field, index) => (
                        <div key={field.id}>
                            <FieldCard
                                field={field}
                                onDelete={() => handleFieldDelete(field.id)}
                                onConfig={() => handleFieldConfig(field)}
                            />

                            <DropZone
                                isOver={dragOverIndex === index + 1}
                                onDragOver={(e) => handleDragOver(e, index + 1)}
                                onDrop={(e) => handleDrop(e, index + 1)}
                            />
                        </div>
                    ))}
            </div>

            {selectedField && (
                <FieldConfigDialog
                    field={selectedField}
                    open={isConfigOpen}
                    onOpenChange={setIsConfigOpen}
                    onSave={handleFieldUpdate}
                />
            )}
        </div>
    )
}

function FieldCard({
    field,
    onDelete,
    onConfig,
}: {
    field: FormField;
    onDelete: () => void;
    onConfig: () => void;
}) {
    // Check if field is incomplete
    const fieldTypesRequiringOptions = ["dropdown", "radio", "checkbox", "multi_select"];
    const requiresOptions = fieldTypesRequiringOptions.includes(field.type);
    const hasOptions = field.options && field.options.length > 0;
    const hasEmptyLabel = !field.label || field.label.trim() === "";
    const hasEmptyOptions = field.options?.some(opt => !opt.label || opt.label.trim() === "") || false;

    const isIncomplete = hasEmptyLabel || (requiresOptions && !hasOptions) || hasEmptyOptions;
    const warningMessage = hasEmptyLabel
        ? "Field label is required"
        : requiresOptions && !hasOptions
        ? "This field requires at least one option"
        : hasEmptyOptions
        ? "Some options are missing labels"
        : "";

    return (
        <Card className={cn(
            "p-3 md:p-4 hover:shadow-md transition-shadow group",
            isIncomplete && "border-orange-500/50 bg-orange-50/10 dark:bg-orange-950/10"
        )}>
            <div className="flex items-start gap-2 md:gap-3">
                <div className="cursor-grab active:cursor-grabbing pt-1 hidden md:block">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 flex items-start gap-2">
                            <div className="flex-1">
                                <label className="text-sm font-medium">
                                    {field.label || <span className="text-muted-foreground italic">Untitled Field</span>}
                                    {field.required && <span className="text-destructive ml-1">*</span>}
                                </label>
                                {field.description && (
                                    <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
                                )}
                            </div>
                            {isIncomplete && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Badge variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400 gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                <span className="hidden sm:inline">Incomplete</span>
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{warningMessage}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>

                    <FieldPreview field={field} />
                </div>

                <div className="flex gap-1 md:gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button size="icon" variant="ghost" onClick={onConfig} className="h-8 w-8 md:h-10 md:w-10">
                        <Settings className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={onDelete} className="h-8 w-8 md:h-10 md:w-10">
                        <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}

function FieldPreview({ field }: { field: FormField }) {
    const previewMap: Record<string, React.ReactNode> = {
        short_text: <Input placeholder={field.placeholder} disabled />,
        long_text: <Textarea placeholder={field.placeholder} disabled rows={3} />,
        email: <Input type="email" placeholder={field.placeholder || "email@example.com"} disabled />,
        number: <Input type="number" placeholder={field.placeholder} disabled />,
        date: <Input type="date" disabled />,
        dropdown: (
            <select className="w-full rounded-md border border-input bg-background px-3 py-2" disabled>
                <option>Select an option...</option>
            </select>
        ),
        checkbox: (
            <div className="flex items-center gap-2">
                <input type="checkbox" disabled />
                <span className="text-sm">Option 1</span>
            </div>
        ),
        radio: (
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <input type="radio" disabled />
                    <span className="text-sm">Option 1</span>
                </div>
            </div>
        ),
    };

    return previewMap[field.type] || <div className="text-sm text-muted-foreground">Preview not available</div>;
}

function DropZone({
    isOver,
    onDragOver,
    onDrop,
    isEmpty = false,
}: {
    isOver: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    isEmpty?: boolean;
}) {
    return (
        <div
            onDragOver={onDragOver}
            onDrop={onDrop}
            className={cn(
                "transition-all duration-200 rounded-lg border-2 border-dashed",
                isOver
                    ? "border-primary bg-primary/5 h-24"
                    : isEmpty
                        ? "border-muted-foreground/30 bg-muted/20 h-48"
                        : "border-transparent h-4 hover:h-12 hover:border-muted-foreground/30"
            )}
        >
            {isEmpty && (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <Plus className="h-8 w-8 mb-2" />
                    <p className="text-sm font-medium">Drag fields here to get started</p>
                    <p className="text-xs">Or click on a field to add it</p>
                </div>
            )}
            {isOver && !isEmpty && (
                <div className="h-full flex items-center justify-center">
                    <Plus className="h-6 w-6 text-primary" />
                </div>
            )}
        </div>
    )
}