"use client";

import { useState } from "react";
import { FormField, FieldOption } from "@/lib/types/form-types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, GripVertical, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface FieldConfigDialogProps {
    field: FormField;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (field: FormField) => void;
}

export function FieldConfigDialog({
    field: initialField,
    open,
    onOpenChange,
    onSave,
}: FieldConfigDialogProps) {
    const [field, setField] = useState<FormField>(initialField);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    function validateField(): boolean {
        const errors: string[] = [];

        // Check if label is empty
        if (!field.label || field.label.trim() === "") {
            errors.push("Field label is required");
        }

        // Check if fields that require options have at least one option
        if (supportsOptions) {
            const options = field.options || [];
            if (options.length === 0) {
                errors.push(`${getFieldTypeName(field.type)} fields require at least one option`);
            } else {
                // Check if any option has empty label
                const emptyOptions = options.filter(opt => !opt.label || opt.label.trim() === "");
                if (emptyOptions.length > 0) {
                    errors.push("All options must have a label");
                }
            }
        }

        setValidationErrors(errors);
        return errors.length === 0;
    }

    function handleSave() {
        if (validateField()) {
            onSave(field);
            onOpenChange(false);
        } else {
            toast.error("Please fix the validation errors before saving");
        }
    }

    function updateField(updates: Partial<Omit<FormField, "type">>) {
        setField((prev) => ({ ...prev, ...updates }));
        // Clear validation errors when user makes changes
        if (validationErrors.length > 0) {
            setValidationErrors([]);
        }
    }

    const supportsOptions = ["dropdown", "radio", "checkbox", "multi_select"].includes(field.type);

    function getFieldTypeName(type: string): string {
        const names: Record<string, string> = {
            dropdown: "Dropdown",
            radio: "Radio",
            checkbox: "Checkbox Group",
            multi_select: "Multi-Select",
        };
        return names[type] || type;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Configure Field</DialogTitle>
                    <DialogDescription>
                        Customize the field settings and appearance
                    </DialogDescription>
                </DialogHeader>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <ul className="list-disc list-inside space-y-1">
                                {validationErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="general" className="flex-1 overflow-hidden flex flex-col">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="options" disabled={!supportsOptions}>
                            Options
                        </TabsTrigger>
                        <TabsTrigger value="validation">Validation</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-auto py-4">
                        <TabsContent value="general" className="space-y-4 mt-0">
                            <div className="space-y-2">
                                <Label htmlFor="label">Label</Label>
                                <Input
                                    id="label"
                                    value={field.label}
                                    onChange={(e) => updateField({ label: e.target.value })}
                                    placeholder="Enter field label"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={field.description || ""}
                                    onChange={(e) => updateField({ description: e.target.value })}
                                    placeholder="Add helpful text for users"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="placeholder">Placeholder (Optional)</Label>
                                <Input
                                    id="placeholder"
                                    value={field.placeholder || ""}
                                    onChange={(e) => updateField({ placeholder: e.target.value })}
                                    placeholder="e.g., Enter your answer here"
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="required">Required Field</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Users must fill this field to submit
                                    </p>
                                </div>
                                <Switch
                                    id="required"
                                    checked={field.required}
                                    onCheckedChange={(checked) => updateField({ required: checked })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="width">Field Width</Label>
                                <select
                                    id="width"
                                    value={field.layout.width}
                                    onChange={(e) =>
                                        updateField({
                                            layout: { ...field.layout, width: e.target.value as any },
                                        })
                                    }
                                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                                >
                                    <option value="full">Full Width</option>
                                    <option value="half">Half Width</option>
                                    <option value="third">One Third</option>
                                    <option value="quarter">One Quarter</option>
                                </select>
                            </div>
                        </TabsContent>

                        <TabsContent value="options" className="space-y-4 mt-0">
                            {supportsOptions && (
                                <FieldOptionsEditor
                                    field={field}
                                    onUpdate={(options) => updateField({ options } as any)}
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="validation" className="space-y-4 mt-0">
                            <ValidationRulesEditor
                                field={field}
                                onUpdate={(validation) => updateField({ validation })}
                            />
                        </TabsContent>
                    </div>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function FieldOptionsEditor({
    field,
    onUpdate,
}: {
    field: any;
    onUpdate: (options: FieldOption[]) => void;
}) {
    const options = field.options || [];

    function addOption() {
        const newOption: FieldOption = {
            id: `option-${Date.now()}`,
            label: `Option ${options.length + 1}`,
            value: `option_${options.length + 1}`,
        };
        onUpdate([...options, newOption]);
    }

    function updateOption(index: number, updates: Partial<FieldOption>) {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], ...updates };
        onUpdate(newOptions);
    }

    function deleteOption(index: number) {
        const newOptions = options.filter((_: any, i: number) => i !== index);
        onUpdate(newOptions);
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button size="sm" variant="outline" onClick={addOption}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Option
                </Button>
            </div>

            <div className="space-y-2">
                {options.map((option: FieldOption, index: number) => (
                    <Card key={option.id} className="p-3">
                        <div className="flex items-center gap-3">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                            <Input
                                value={option.label}
                                onChange={(e) => updateOption(index, { label: e.target.value })}
                                placeholder="Option label"
                                className="flex-1"
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteOption(index)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </Card>
                ))}

                {options.length === 0 && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <p className="font-medium">Options Required</p>
                            <p className="text-sm mt-1">
                                This field type requires at least one option. Click "Add Option" above to get started.
                            </p>
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    );
}

function ValidationRulesEditor({
    field,
    onUpdate,
}: {
    field: FormField;
    onUpdate: (validation: any[]) => void;
}) {

    const hasMinLength = field.validation.find((v) => v.type === "min_length");
    const hasMaxLength = field.validation.find((v) => v.type === "max_length");
    const hasMinValue = field.validation.find((v) => v.type === "min_value");
    const hasMaxValue = field.validation.find((v) => v.type === "max_value");

    const isTextType = ["short_text", "long_text", "email", "phone", "url"].includes(
        field.type
    );
    const isNumberType = ["number", "currency"].includes(field.type);

    function updateValidation(type: string, value: any, enabled: boolean) {
        let newValidation = field.validation.filter((v) => v.type !== type);

        if (enabled && value) {
            newValidation.push({
                type: type as any,
                value: type.includes("length") ? parseInt(value) : value,
                message: `Please enter a valid ${type.replace(/_/g, " ")}`,
            });
        }

        onUpdate(newValidation);
    }

    return (
        <div className="space-y-4">
            <div>
                <Label>Validation Rules</Label>
                <p className="text-sm text-muted-foreground">
                    Add constraints to validate user input
                </p>
            </div>

            {isTextType && (
                <>
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <Switch
                                checked={!!hasMinLength}
                                onCheckedChange={(checked) =>
                                    updateValidation("min_length", 1, checked)
                                }
                            />
                            <Label>Minimum Length</Label>
                        </div>
                        {hasMinLength && (
                            <Input
                                type="number"
                                value={hasMinLength.value}
                                onChange={(e) =>
                                    updateValidation("min_length", e.target.value, true)
                                }
                                placeholder="Minimum characters"
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <Switch
                                checked={!!hasMaxLength}
                                onCheckedChange={(checked) =>
                                    updateValidation("max_length", 100, checked)
                                }
                            />
                            <Label>Maximum Length</Label>
                        </div>
                        {hasMaxLength && (
                            <Input
                                type="number"
                                value={hasMaxLength.value}
                                onChange={(e) =>
                                    updateValidation("max_length", e.target.value, true)
                                }
                                placeholder="Maximum characters"
                            />
                        )}
                    </div>
                </>
            )}

            {isNumberType && (
                <>
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <Switch
                                checked={!!hasMinValue}
                                onCheckedChange={(checked) =>
                                    updateValidation("min_value", 0, checked)
                                }
                            />
                            <Label>Minimum Value</Label>
                        </div>
                        {hasMinValue && (
                            <Input
                                type="number"
                                value={hasMinValue.value}
                                onChange={(e) =>
                                    updateValidation("min_value", e.target.value, true)
                                }
                                placeholder="Minimum value"
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <Switch
                                checked={!!hasMaxValue}
                                onCheckedChange={(checked) =>
                                    updateValidation("max_value", 100, checked)
                                }
                            />
                            <Label>Maximum Value</Label>
                        </div>
                        {hasMaxValue && (
                            <Input
                                type="number"
                                value={hasMaxValue.value}
                                onChange={(e) =>
                                    updateValidation("max_value", e.target.value, true)
                                }
                                placeholder="Maximum value"
                            />
                        )}
                    </div>
                </>
            )}

            {field.validation.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                    No validation rules configured
                </div>
            )}
        </div>
    );
}