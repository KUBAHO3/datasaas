"use client";

import { useState } from "react";
import { Form } from "@/lib/types/form-types";
import { Button } from "@/components/ui/button";
import { Save, Eye, Settings, Palette, Share2, CheckCircle, Archive } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAction } from "next-safe-action/hooks";
import { updateFormAction, publishFormAction, archiveFormAction } from "@/lib/services/actions/form.actions";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormBuilderSidebar } from "./form-builder-sidebar";
import { FormBuilderCanvas } from "./form-builder-canvas";
import { FormSettingsPanel } from "./form-settings-panel";
import { FormThemePanel } from "./form-theme-panel";
import { FormSharePanel } from "./form-share-panel";
import { EditableFormHeader } from "./editable-form-header";

interface FormBuilderProps {
    form: Form;
    orgId: string;
}

export function FormBuilder({ form: initialForm, orgId }: FormBuilderProps) {
    const router = useRouter();
    const [form, setForm] = useState(initialForm);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeTab, setActiveTab] = useState("build");

    const { execute: saveForm, isExecuting: isSaving } = useAction(updateFormAction, {
        onSuccess: ({ data }) => {
            if (data?.success) {
                toast.success("Form saved successfully!");
                setHasChanges(false);
                router.refresh();
            } else {
                toast.error(data?.error || "Failed to save form");
            }
        },
    });

    const { execute: publishForm, isExecuting: isPublishing } = useAction(publishFormAction, {
        onSuccess: ({ data }) => {
            if (data?.success) {
                toast.success("Form published successfully!");
                setHasChanges(false);
                router.refresh();
            } else {
                toast.error(data?.error || "Failed to publish form");
            }
        },
    });

    const { execute: archiveForm, isExecuting: isArchiving } = useAction(archiveFormAction, {
        onSuccess: ({ data }) => {
            if (data?.success) {
                toast.success("Form archived successfully!");
                router.refresh();
            } else {
                toast.error(data?.error || "Failed to archive form");
            }
        },
    });

    function validateFormFields(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        const fieldTypesRequiringOptions = ["dropdown", "radio", "checkbox", "multi_select"];

        form.fields.forEach((field, index) => {
            // Check if field has a label
            if (!field.label || field.label.trim() === "") {
                errors.push(`Field ${index + 1} is missing a label`);
            }

            // Check if fields requiring options have at least one option
            if (fieldTypesRequiringOptions.includes(field.type)) {
                const options = field.options || [];
                if (options.length === 0) {
                    errors.push(`Field "${field.label || `#${index + 1}`}" requires at least one option`);
                } else {
                    // Check if all options have labels
                    const emptyOptions = options.filter(opt => !opt.label || opt.label.trim() === "");
                    if (emptyOptions.length > 0) {
                        errors.push(`Field "${field.label || `#${index + 1}`}" has options without labels`);
                    }
                }
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    function handleSave() {
        // Validate form fields before saving
        const validation = validateFormFields();
        if (!validation.isValid) {
            toast.error("Form has validation errors", {
                description: validation.errors[0] + (validation.errors.length > 1 ? ` (and ${validation.errors.length - 1} more)` : ""),
            });
            return;
        }

        saveForm({
            formId: form.$id,
            name: form.name,
            description: form.description,
            fields: form.fields,
            steps: form.steps,
            conditionalLogic: form.conditionalLogic,
            settings: form.settings,
            theme: form.theme,
            accessControl: form.accessControl,
        });
    }

    async function handlePublish() {
        // Validate form has at least one field
        if (form.fields.length === 0) {
            toast.error("Cannot publish form without any fields");
            return;
        }

        // Validate form fields
        const validation = validateFormFields();
        if (!validation.isValid) {
            toast.error("Cannot publish form with validation errors", {
                description: (
                    <div className="mt-2 space-y-1">
                        {validation.errors.slice(0, 3).map((error, i) => (
                            <div key={i} className="text-sm">• {error}</div>
                        ))}
                        {validation.errors.length > 3 && (
                            <div className="text-sm">• ...and {validation.errors.length - 3} more</div>
                        )}
                    </div>
                ),
            });
            return;
        }

        // If there are unsaved changes, user should save first
        if (hasChanges) {
            toast.error("Please save your changes before publishing");
            return;
        }

        // Publish the form
        publishForm({ formId: form.$id });
    }

    function handleArchive() {
        if (confirm("Are you sure you want to unpublish this form? It will no longer be accessible to users.")) {
            archiveForm({ formId: form.$id });
        }
    }

    function updateForm(updates: Partial<Form>) {
        setForm((prev) => ({ ...prev, ...updates }));
        setHasChanges(true);
    }

    function handleUpdateIdentity(updates: { name?: string; description?: string }) {
        updateForm(updates);
    }

    console.log("foooorrmmm data: ", form)

    return (
        <div className="h-screen flex flex-col">
            <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="flex flex-col sm:flex-row min-h-16 items-start sm:items-center px-4 sm:px-6 py-3 sm:py-0 gap-3 sm:gap-4">
                    <EditableFormHeader
                        form={form}
                        hasChanges={hasChanges}
                        onUpdate={handleUpdateIdentity}
                    />

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                        <Button variant="outline" size="sm" asChild className="shrink-0">
                            <Link href={`/org/${orgId}/forms/${form.$id}/preview`}>
                                <Eye className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Preview</span>
                            </Link>
                        </Button>

                        {/* Show different buttons based on form status */}
                        {form.status === "draft" && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={!hasChanges || isSaving}
                                    className="shrink-0"
                                >
                                    <Save className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save Draft"}</span>
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handlePublish}
                                    disabled={isPublishing || form.fields.length === 0}
                                    className="shrink-0"
                                >
                                    <CheckCircle className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">{isPublishing ? "Publishing..." : "Publish"}</span>
                                </Button>
                            </>
                        )}

                        {form.status === "published" && (
                            <>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={!hasChanges || isSaving}
                                    className="shrink-0"
                                >
                                    <Save className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save Changes"}</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleArchive}
                                    disabled={isArchiving}
                                    className="shrink-0"
                                >
                                    <Archive className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">{isArchiving ? "Unpublishing..." : "Unpublish"}</span>
                                </Button>
                            </>
                        )}

                        {form.status === "archived" && (
                            <Button size="sm" onClick={handlePublish} disabled={isPublishing} className="shrink-0">
                                <CheckCircle className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">{isPublishing ? "Publishing..." : "Re-publish"}</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <div className="border-b px-4 sm:px-6 overflow-x-auto">
                        <TabsList className="w-full sm:w-auto justify-start">
                            <TabsTrigger value="build" className="flex-1 sm:flex-initial">
                                <span className="sm:hidden">Build</span>
                                <span className="hidden sm:inline">Build</span>
                            </TabsTrigger>
                            <TabsTrigger value="settings" className="flex-1 sm:flex-initial">
                                <Settings className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Settings</span>
                            </TabsTrigger>
                            <TabsTrigger value="theme" className="flex-1 sm:flex-initial">
                                <Palette className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Theme</span>
                            </TabsTrigger>
                            <TabsTrigger value="share" className="flex-1 sm:flex-initial">
                                <Share2 className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Share</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="build" className="flex-1 flex m-0 flex-col md:flex-row overflow-hidden h-0">
                        <FormBuilderSidebar />
                        <FormBuilderCanvas form={form} updateForm={updateForm} />
                    </TabsContent>

                    <TabsContent value="settings" className="flex-1 p-6 overflow-auto">
                        <FormSettingsPanel
                            settings={form.settings}
                            accessControl={form.accessControl}
                            onUpdate={(settings, accessControl) => {
                                updateForm({ settings, accessControl });
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="theme" className="flex-1 p-6 overflow-auto">
                        <FormThemePanel
                            theme={form.theme}
                            onUpdate={(theme) => updateForm({ theme })}
                        />
                    </TabsContent>

                    <TabsContent value="share" className="flex-1 p-6 overflow-auto">
                        <FormSharePanel form={form} orgId={orgId} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}