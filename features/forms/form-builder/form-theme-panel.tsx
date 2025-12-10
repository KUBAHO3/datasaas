"use client";

import { FormTheme } from "@/lib/types/form-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface FormThemePanelProps {
    theme: FormTheme;
    onUpdate: (theme: FormTheme) => void;
}

export function FormThemePanel({ theme, onUpdate }: FormThemePanelProps) {
    function updateTheme(updates: Partial<FormTheme>) {
        onUpdate({ ...theme, ...updates });
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Form Theme</h2>
                <p className="text-muted-foreground">
                    Customize the look and feel of your form
                </p>
            </div>

            {/* Colors */}
            <Card>
                <CardHeader>
                    <CardTitle>Colors</CardTitle>
                    <CardDescription>Set your form's color scheme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="primaryColor">Primary Color</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="primaryColor"
                                    type="color"
                                    value={theme.primaryColor}
                                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                                    className="w-16 h-10"
                                />
                                <Input
                                    type="text"
                                    value={theme.primaryColor}
                                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                                    placeholder="#1e293b"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="backgroundColor">Background Color</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="backgroundColor"
                                    type="color"
                                    value={theme.backgroundColor}
                                    onChange={(e) =>
                                        updateTheme({ backgroundColor: e.target.value })
                                    }
                                    className="w-16 h-10"
                                />
                                <Input
                                    type="text"
                                    value={theme.backgroundColor}
                                    onChange={(e) =>
                                        updateTheme({ backgroundColor: e.target.value })
                                    }
                                    placeholder="#ffffff"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Typography */}
            <Card>
                <CardHeader>
                    <CardTitle>Typography</CardTitle>
                    <CardDescription>Customize text appearance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="fontFamily">Font Family</Label>
                        <select
                            id="fontFamily"
                            value={theme.fontFamily}
                            onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                        >
                            <option value="Inter">Inter</option>
                            <option value="Arial">Arial</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fontSize">Font Size</Label>
                        <select
                            id="fontSize"
                            value={theme.fontSize}
                            onChange={(e) => updateTheme({ fontSize: e.target.value })}
                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                        >
                            <option value="14px">Small (14px)</option>
                            <option value="16px">Medium (16px)</option>
                            <option value="18px">Large (18px)</option>
                            <option value="20px">Extra Large (20px)</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Button Style */}
            <Card>
                <CardHeader>
                    <CardTitle>Button Style</CardTitle>
                    <CardDescription>Choose button appearance</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        {(["rounded", "square", "pill"] as const).map((style) => (
                            <button
                                key={style}
                                onClick={() => updateTheme({ buttonStyle: style })}
                                className={`p-4 border-2 rounded-lg transition-colors ${theme.buttonStyle === style
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                    }`}
                            >
                                <div
                                    className={`h-10 bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium ${style === "rounded"
                                            ? "rounded-md"
                                            : style === "pill"
                                                ? "rounded-full"
                                                : ""
                                        }`}
                                >
                                    {style.charAt(0).toUpperCase() + style.slice(1)}
                                </div>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Additional Options */}
            <Card>
                <CardHeader>
                    <CardTitle>Display Options</CardTitle>
                    <CardDescription>Additional visual settings</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label>Show Progress Bar</Label>
                            <p className="text-sm text-muted-foreground">
                                Display progress at top of form
                            </p>
                        </div>
                        <Switch
                            checked={theme.showProgressBar}
                            onCheckedChange={(checked) =>
                                updateTheme({ showProgressBar: checked })
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>See how your theme looks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        className="p-8 rounded-lg"
                        style={{ backgroundColor: theme.backgroundColor }}
                    >
                        <h3
                            className="text-2xl font-bold mb-4"
                            style={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}
                        >
                            Sample Form Title
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{ fontFamily: theme.fontFamily, fontSize: theme.fontSize }}
                                >
                                    Sample Question
                                </label>
                                <input
                                    type="text"
                                    placeholder="Type your answer..."
                                    className="w-full px-4 py-2 border rounded-md"
                                    style={{
                                        fontFamily: theme.fontFamily,
                                        fontSize: theme.fontSize,
                                    }}
                                    disabled
                                />
                            </div>
                            <button
                                className={`px-6 py-2 text-white font-medium ${theme.buttonStyle === "rounded"
                                        ? "rounded-md"
                                        : theme.buttonStyle === "pill"
                                            ? "rounded-full"
                                            : ""
                                    }`}
                                style={{
                                    backgroundColor: theme.primaryColor,
                                    fontFamily: theme.fontFamily,
                                }}
                                disabled
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}