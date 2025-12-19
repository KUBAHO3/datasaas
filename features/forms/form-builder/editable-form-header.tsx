"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, X, Check } from "lucide-react";
import { Form } from "@/lib/types/form-types";

interface EditableFormHeaderProps {
    form: Form;
    hasChanges: boolean;
    onUpdate: (updates: { name?: string; description?: string }) => void;
}

export function EditableFormHeader({ form, hasChanges, onUpdate }: EditableFormHeaderProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [nameValue, setNameValue] = useState(form.name);
    const [descriptionValue, setDescriptionValue] = useState(form.description || "");

    const nameInputRef = useRef<HTMLInputElement>(null);
    const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-focus and select all when entering edit mode
    useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus();
            nameInputRef.current.select();
        }
    }, [isEditingName]);

    useEffect(() => {
        if (isEditingDescription && descriptionInputRef.current) {
            descriptionInputRef.current.focus();
            descriptionInputRef.current.select();
        }
    }, [isEditingDescription]);

    // Update local values when form changes
    useEffect(() => {
        setNameValue(form.name);
        setDescriptionValue(form.description || "");
    }, [form.name, form.description]);

    const handleNameSave = () => {
        const trimmedName = nameValue.trim();
        if (trimmedName && trimmedName !== form.name) {
            onUpdate({ name: trimmedName });
        } else {
            setNameValue(form.name); // Reset if empty or unchanged
        }
        setIsEditingName(false);
    };

    const handleNameCancel = () => {
        setNameValue(form.name);
        setIsEditingName(false);
    };

    const handleNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleNameSave();
        } else if (e.key === "Escape") {
            e.preventDefault();
            handleNameCancel();
        }
    };

    const handleDescriptionSave = () => {
        const trimmedDescription = descriptionValue.trim();
        if (trimmedDescription !== (form.description || "")) {
            onUpdate({ description: trimmedDescription });
        }
        setIsEditingDescription(false);
    };

    const handleDescriptionCancel = () => {
        setDescriptionValue(form.description || "");
        setIsEditingDescription(false);
    };

    const handleDescriptionKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleDescriptionSave();
        } else if (e.key === "Escape") {
            e.preventDefault();
            handleDescriptionCancel();
        }
    };

    return (
        <div className="flex-1 min-w-0">
            {/* Form Name */}
            <div className="flex items-center gap-2">
                {isEditingName ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Input
                            ref={nameInputRef}
                            value={nameValue}
                            onChange={(e) => setNameValue(e.target.value)}
                            onBlur={handleNameSave}
                            onKeyDown={handleNameKeyDown}
                            className="h-8 text-base md:text-lg font-semibold max-w-full md:max-w-md"
                            placeholder="Enter form name..."
                        />
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleNameSave}
                            className="h-8 w-8 p-0 shrink-0"
                        >
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleNameCancel}
                            className="h-8 w-8 p-0 shrink-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditingName(true)}
                        className="group flex items-center gap-2 hover:bg-accent rounded px-2 py-1 transition-colors min-w-0"
                    >
                        <h1 className="text-base md:text-lg font-semibold truncate">{form.name}</h1>
                        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
                    </button>
                )}

                <Badge
                    variant={
                        form.status === "published"
                            ? "default"
                            : form.status === "archived"
                            ? "secondary"
                            : "outline"
                    }
                    className="shrink-0 text-xs"
                >
                    {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                </Badge>
            </div>

            {/* Form Description */}
            <div className="mt-1 hidden sm:block">
                {isEditingDescription ? (
                    <div className="flex items-start gap-2">
                        <Textarea
                            ref={descriptionInputRef}
                            value={descriptionValue}
                            onChange={(e) => setDescriptionValue(e.target.value)}
                            onBlur={handleDescriptionSave}
                            onKeyDown={handleDescriptionKeyDown}
                            className="min-h-[60px] text-sm max-w-full md:max-w-md resize-none"
                            placeholder="Enter form description... (Ctrl+Enter to save)"
                        />
                        <div className="flex flex-col gap-1 shrink-0">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleDescriptionSave}
                                className="h-7 w-7 p-0"
                            >
                                <Check className="h-3 w-3" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleDescriptionCancel}
                                className="h-7 w-7 p-0"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditingDescription(true)}
                        className="group flex items-center gap-2 hover:bg-accent rounded px-2 py-1 transition-colors text-left w-full min-w-0"
                    >
                        <p className="text-xs md:text-sm text-muted-foreground truncate">
                            {form.description || "Click to add description..."}
                        </p>
                        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
                    </button>
                )}

                {!isEditingDescription && (
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 px-2">
                        {hasChanges ? "Unsaved changes" : "All changes saved"}
                    </p>
                )}
            </div>
        </div>
    );
}
