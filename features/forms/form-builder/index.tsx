"use client";

import { useState } from "react";
import { Form } from "@/lib/types/form-types";
import { Button } from "@/components/ui/button";
import { Save, Eye, Settings, Palette, Share2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAction } from "next-safe-action/hooks";
import { updateFormAction } from "@/lib/services/actions/form.actions";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormBuilderSidebar } from "./form-builder-sidebar";
import { FormBuilderCanvas } from "./form-builder-canvas";
import { FormSettingsPanel } from "./form-settings-panel";
import { FormThemePanel } from "./form-theme-panel";

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

    function handleSave() {
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

    function updateForm(updates: Partial<Form>) {
        setForm((prev) => ({ ...prev, ...updates }));
        setHasChanges(true);
    }

    return (
        <div className="h-screen flex flex-col">
            <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="flex h-16 items-center px-6 gap-4">
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold truncate">{form.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {hasChanges ? "Unsaved changes" : "All changes saved"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/org/${orgId}/forms/${form.$id}/preview`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={!hasChanges || isSaving}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <div className="border-b px-6">
                        <TabsList>
                            <TabsTrigger value="build">Build</TabsTrigger>
                            <TabsTrigger value="settings">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </TabsTrigger>
                            <TabsTrigger value="theme">
                                <Palette className="mr-2 h-4 w-4" />
                                Theme
                            </TabsTrigger>
                            <TabsTrigger value="share">
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="build" className="flex-1 flex m-0">
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
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Share Your Form</h2>
                                <p className="text-muted-foreground">
                                    Configure sharing options and get your form link
                                </p>
                            </div>
                            {/* Share options will be added in Phase 3 */}
                            <div className="text-center py-12 text-muted-foreground">
                                Publishing and sharing features coming soon...
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}