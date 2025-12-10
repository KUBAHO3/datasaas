"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Type, Hash, Calendar, ChevronDown, CheckSquare, Upload, Star, MapPin } from "lucide-react";

const FIELD_TYPES = [
    {
        category: "Basic",
        fields: [
            { type: "short_text", label: "Short Text", icon: Type, description: "Single line text input" },
            { type: "long_text", label: "Long Text", icon: Type, description: "Multi-line text area" },
            { type: "email", label: "Email", icon: Type, description: "Email address input" },
            { type: "phone", label: "Phone", icon: Type, description: "Phone number input" },
            { type: "number", label: "Number", icon: Hash, description: "Numeric input" },
        ],
    },
    {
        category: "Choice",
        fields: [
            { type: "dropdown", label: "Dropdown", icon: ChevronDown, description: "Single selection dropdown" },
            { type: "radio", label: "Radio Buttons", icon: CheckSquare, description: "Single choice from list" },
            { type: "checkbox", label: "Checkboxes", icon: CheckSquare, description: "Multiple selections" },
            { type: "multi_select", label: "Multi Select", icon: ChevronDown, description: "Multiple dropdown selections" },
        ],
    },
    {
        category: "Date & Time",
        fields: [
            { type: "date", label: "Date", icon: Calendar, description: "Date picker" },
            { type: "datetime", label: "Date & Time", icon: Calendar, description: "Date and time picker" },
            { type: "time", label: "Time", icon: Calendar, description: "Time picker" },
        ],
    },
    {
        category: "Advanced",
        fields: [
            { type: "file_upload", label: "File Upload", icon: Upload, description: "File attachment" },
            { type: "rating", label: "Rating", icon: Star, description: "Star rating" },
            { type: "location", label: "Location", icon: MapPin, description: "Address or coordinates" },
        ],
    },
];

export function FormBuilderSidebar() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCategories = FIELD_TYPES.map((category) => ({
        ...category,
        fields: category.fields.filter(
            (field) =>
                field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                field.description.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    })).filter((category) => category.fields.length > 0);

    function handleDragStart(e: React.DragEvent, fieldType: string) {
        e.dataTransfer.setData("fieldType", fieldType);
        e.dataTransfer.effectAllowed = "copy";
    }

    return (
        <div className="w-80 border-r bg-muted/10 flex flex-col">
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search fields..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-6">
                {filteredCategories.map((category) => (
                    <div key={category.category} className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            {category.category}
                        </h3>
                        <div className="space-y-2">
                            {category.fields.map((field) => {
                                const Icon = field.icon;
                                return (
                                    <Card
                                        key={field.type}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, field.type)}
                                        className="p-3 cursor-grab active:cursor-grabbing hover:bg-accent transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-md bg-primary/10 p-2">
                                                <Icon className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium">{field.label}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                    {field.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {filteredCategories.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No fields found matching "{searchQuery}"
                    </div>
                )}
            </div>
        </div>
    )
}