"use client";

import { FormSettings, FormAccessControl } from "@/lib/types/form-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface FormSettingsPanelProps {
    settings: FormSettings;
    accessControl: FormAccessControl;
    onUpdate: (settings: FormSettings, accessControl: FormAccessControl) => void;
}

export function FormSettingsPanel({
    settings,
    accessControl,
    onUpdate,
}: FormSettingsPanelProps) {
    function updateSettings(updates: Partial<FormSettings>) {
        onUpdate({ ...settings, ...updates }, accessControl);
    }

    function updateAccessControl(updates: Partial<FormAccessControl>) {
        onUpdate(settings, { ...accessControl, ...updates });
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Form Settings</h2>
                <p className="text-muted-foreground">
                    Configure how your form behaves and who can access it
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Access & Visibility</CardTitle>
                    <CardDescription>Control who can view and submit your form</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="visibility">Form Visibility</Label>
                        <select
                            id="visibility"
                            value={accessControl.visibility}
                            onChange={(e) =>
                                updateAccessControl({ visibility: e.target.value as any })
                            }
                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                        >
                            <option value="private">Private - Team members only</option>
                            <option value="team">Team - All company members</option>
                            <option value="public">Public - Anyone with link</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label>Require Login</Label>
                            <p className="text-sm text-muted-foreground">
                                Users must sign in to submit
                            </p>
                        </div>
                        <Switch
                            checked={settings.requireLogin}
                            onCheckedChange={(checked) => updateSettings({ requireLogin: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label>Allow Anonymous Submissions</Label>
                            <p className="text-sm text-muted-foreground">
                                Accept responses without user identification
                            </p>
                        </div>
                        <Switch
                            checked={settings.allowAnonymous}
                            onCheckedChange={(checked) =>
                                updateSettings({ allowAnonymous: checked })
                            }
                        />
                    </div>

                    {accessControl.visibility === "public" && (
                        <div className="space-y-2">
                            <Label htmlFor="maxSubmissions">Maximum Submissions (Optional)</Label>
                            <Input
                                id="maxSubmissions"
                                type="number"
                                value={accessControl.maxSubmissions || ""}
                                onChange={(e) =>
                                    updateAccessControl({
                                        maxSubmissions: e.target.value ? parseInt(e.target.value) : undefined,
                                    })
                                }
                                placeholder="Leave empty for unlimited"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Response Settings</CardTitle>
                    <CardDescription>Configure submission behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label>Allow Multiple Submissions</Label>
                            <p className="text-sm text-muted-foreground">
                                Users can submit the form more than once
                            </p>
                        </div>
                        <Switch
                            checked={settings.allowMultipleSubmissions}
                            onCheckedChange={(checked) =>
                                updateSettings({ allowMultipleSubmissions: checked })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label>Allow Editing After Submission</Label>
                            <p className="text-sm text-muted-foreground">
                                Users can edit their submitted responses
                            </p>
                        </div>
                        <Switch
                            checked={settings.allowEdit}
                            onCheckedChange={(checked) => updateSettings({ allowEdit: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label>Enable Auto-Save</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically save draft responses
                            </p>
                        </div>
                        <Switch
                            checked={settings.enableAutoSave}
                            onCheckedChange={(checked) =>
                                updateSettings({ enableAutoSave: checked })
                            }
                        />
                    </div>

                    {settings.enableAutoSave && (
                        <div className="space-y-2">
                            <Label htmlFor="autoSaveInterval">Auto-Save Interval (seconds)</Label>
                            <Input
                                id="autoSaveInterval"
                                type="number"
                                value={settings.autoSaveInterval}
                                onChange={(e) =>
                                    updateSettings({ autoSaveInterval: parseInt(e.target.value) })
                                }
                                min={10}
                                max={300}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Display Settings</CardTitle>
                    <CardDescription>Customize form appearance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label>Show Progress Bar</Label>
                            <p className="text-sm text-muted-foreground">
                                Display completion progress
                            </p>
                        </div>
                        <Switch
                            checked={settings.showProgressBar}
                            onCheckedChange={(checked) =>
                                updateSettings({ showProgressBar: checked })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label>Show Question Numbers</Label>
                            <p className="text-sm text-muted-foreground">
                                Number each field sequentially
                            </p>
                        </div>
                        <Switch
                            checked={settings.showQuestionNumbers}
                            onCheckedChange={(checked) =>
                                updateSettings({ showQuestionNumbers: checked })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label>Shuffle Questions</Label>
                            <p className="text-sm text-muted-foreground">
                                Randomize field order for each user
                            </p>
                        </div>
                        <Switch
                            checked={settings.shuffleQuestions}
                            onCheckedChange={(checked) =>
                                updateSettings({ shuffleQuestions: checked })
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>After Submission</CardTitle>
                    <CardDescription>What happens after form is submitted</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="confirmationMessage">Confirmation Message</Label>
                        <Textarea
                            id="confirmationMessage"
                            value={settings.confirmationMessage}
                            onChange={(e) =>
                                updateSettings({ confirmationMessage: e.target.value })
                            }
                            rows={3}
                            placeholder="Thank you for your submission!"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="redirectUrl">Redirect URL (Optional)</Label>
                        <Input
                            id="redirectUrl"
                            type="url"
                            value={settings.redirectUrl || ""}
                            onChange={(e) => updateSettings({ redirectUrl: e.target.value })}
                            placeholder="https://example.com/thank-you"
                        />
                        <p className="text-xs text-muted-foreground">
                            Redirect users to this URL after submission
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Get notified about new submissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label>Enable Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive emails for new submissions
                            </p>
                        </div>
                        <Switch
                            checked={settings.enableNotifications}
                            onCheckedChange={(checked) =>
                                updateSettings({ enableNotifications: checked })
                            }
                        />
                    </div>

                    {settings.enableNotifications && (
                        <div className="space-y-2">
                            <Label htmlFor="notificationEmails">Notification Emails</Label>
                            <Textarea
                                id="notificationEmails"
                                value={settings.notificationEmails.join(", ")}
                                onChange={(e) =>
                                    updateSettings({
                                        notificationEmails: e.target.value
                                            .split(",")
                                            .map((email) => email.trim())
                                            .filter(Boolean),
                                    })
                                }
                                rows={2}
                                placeholder="email1@example.com, email2@example.com"
                            />
                            <p className="text-xs text-muted-foreground">
                                Separate multiple emails with commas
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Data Collection</CardTitle>
                    <CardDescription>Additional information to collect</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label>Collect Email Address</Label>
                            <p className="text-sm text-muted-foreground">
                                Require respondent email
                            </p>
                        </div>
                        <Switch
                            checked={settings.collectEmail}
                            onCheckedChange={(checked) =>
                                updateSettings({ collectEmail: checked })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label>Collect IP Address</Label>
                            <p className="text-sm text-muted-foreground">
                                Store respondent IP address
                            </p>
                        </div>
                        <Switch
                            checked={settings.collectIpAddress}
                            onCheckedChange={(checked) =>
                                updateSettings({ collectIpAddress: checked })
                            }
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}