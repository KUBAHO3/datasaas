"use client";

import { useState } from "react";
import { Form } from "@/lib/types/form-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Copy,
    ExternalLink,
    Mail,
    QrCode,
    Check,
    AlertCircle,
    Globe,
    Lock,
    Users,
} from "lucide-react";
import { toast } from "sonner";
import { APP_URL } from "@/lib/env-config";

interface FormSharePanelProps {
    form: Form;
    orgId: string;
}

export function FormSharePanel({ form, orgId }: FormSharePanelProps) {
    const [copied, setCopied] = useState(false);

    const formUrl = `${APP_URL}/forms/${form.$id}`;

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    }

    const isPublished = form.status === "published";
    const isDraft = form.status === "draft";
    const isArchived = form.status === "archived";

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Share Your Form</h2>
                <p className="text-muted-foreground">
                    Get your form link and share it with respondents
                </p>
            </div>

            {!isPublished && (
                <Alert variant={isDraft ? "default" : "destructive"}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {isDraft && (
                            <>
                                <strong>This form is a draft.</strong> You must publish it before it can
                                accept responses.
                            </>
                        )}
                        {isArchived && (
                            <>
                                <strong>This form is archived.</strong> It's no longer accepting responses.
                            </>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Form Status</CardTitle>
                    <CardDescription>Current visibility and access settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Status:</span>
                            <Badge
                                variant={
                                    isPublished ? "default" : isDraft ? "secondary" : "outline"
                                }
                            >
                                {form.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {form.accessControl.visibility === "public" ? (
                                <>
                                    <Globe className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium">Public - Anyone with link</span>
                                </>
                            ) : form.accessControl.visibility === "team" ? (
                                <>
                                    <Users className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium">Team - Company members only</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm font-medium">Private - Team members only</span>
                                </>
                            )}
                        </div>
                    </div>

                    {form.settings.requireLogin && (
                        <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                ⚠️ Login required - Users must sign in to submit
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {isPublished && (
                <Card>
                    <CardHeader>
                        <CardTitle>Form Link</CardTitle>
                        <CardDescription>Share this link with your respondents</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input value={formUrl} readOnly className="font-mono text-sm" />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(formUrl)}
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => window.open(formUrl, "_blank")}
                            >
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button variant="outline" className="w-full" disabled>
                                <Mail className="mr-2 h-4 w-4" />
                                Email Link
                                <Badge variant="secondary" className="ml-2 text-xs">
                                    Coming Soon
                                </Badge>
                            </Button>
                            <Button variant="outline" className="w-full" disabled>
                                <QrCode className="mr-2 h-4 w-4" />
                                Generate QR Code
                                <Badge variant="secondary" className="ml-2 text-xs">
                                    Coming Soon
                                </Badge>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isPublished && (
                <Card>
                    <CardHeader>
                        <CardTitle>Embed Options</CardTitle>
                        <CardDescription>Add this form to your website</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Iframe Embed Code</label>
                            <div className="relative">
                                <Input
                                    value={`<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>`}
                                    readOnly
                                    className="font-mono text-xs pr-20"
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1"
                                    onClick={() =>
                                        copyToClipboard(
                                            `<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>`
                                        )
                                    }
                                >
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                💡 <strong>Tip:</strong> Copy this code and paste it into your website's HTML
                                to embed the form.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Response Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Response Statistics</CardTitle>
                    <CardDescription>Track form performance</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Responses</p>
                            <p className="text-2xl font-bold">{form.metadata?.responseCount || 0}</p>
                        </div>
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">Completion Rate</p>
                            <p className="text-2xl font-bold">N/A</p>
                        </div>
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">Avg. Time</p>
                            <p className="text-2xl font-bold">N/A</p>
                        </div>
                    </div>

                    <Button className="w-full mt-4" variant="outline" asChild>
                        <a href={`/org/${orgId}/data-collection?formId=${form.$id}`}>
                            View All Submissions
                        </a>
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>
                        <strong>How do I share my form?</strong> Copy the form link above and send it via
                        email, social media, or embed it on your website.
                    </p>
                    <p>
                        <strong>Who can access my form?</strong> Check the visibility settings in the
                        Settings tab. Public forms are accessible to anyone with the link.
                    </p>
                    <p>
                        <strong>How do I see responses?</strong> Click "View All Submissions" or go to Data
                        Collection in the sidebar.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}