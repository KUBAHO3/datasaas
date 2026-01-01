"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface EmailFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    url: string;
    formTitle: string;
}

export function EmailFormDialog({ open, onOpenChange, url, formTitle }: EmailFormDialogProps) {
    const safeFormTitle = formTitle || "this form";
    const [emailSubject, setEmailSubject] = useState(`Please fill out: ${safeFormTitle}`);
    const [emailBody, setEmailBody] = useState(
        `Hi,\n\nPlease take a moment to fill out this form:\n\n${url}\n\nThank you!`
    );
    const [copied, setCopied] = useState(false);

    function openEmailClient() {
        const mailtoLink = `mailto:?subject=${encodeURIComponent(
            emailSubject
        )}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailtoLink;
        toast.success("Opening email client...");
    }

    function copyEmailTemplate() {
        const template = `Subject: ${emailSubject}\n\n${emailBody}`;
        navigator.clipboard.writeText(template);
        setCopied(true);
        toast.success("Email template copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    }

    function resetTemplate() {
        setEmailSubject(`Please fill out: ${safeFormTitle}`);
        setEmailBody(`Hi,\n\nPlease take a moment to fill out this form:\n\n${url}\n\nThank you!`);
        toast.success("Template reset to default");
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Email Form Link</DialogTitle>
                    <DialogDescription>
                        Customize your email message and share {safeFormTitle} with respondents
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email-subject">Email Subject</Label>
                        <Input
                            id="email-subject"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            placeholder="Enter email subject"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email-body">Email Body</Label>
                        <Textarea
                            id="email-body"
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                            placeholder="Enter email message"
                            rows={8}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            The form link ({url}) is already included in the message.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={openEmailClient} className="flex-1">
                            <Mail className="mr-2 h-4 w-4" />
                            Open in Email Client
                        </Button>
                        <Button onClick={copyEmailTemplate} variant="outline" className="flex-1">
                            {copied ? (
                                <Check className="mr-2 h-4 w-4 text-green-600" />
                            ) : (
                                <Copy className="mr-2 h-4 w-4" />
                            )}
                            Copy Template
                        </Button>
                        <Button onClick={resetTemplate} variant="ghost">
                            Reset
                        </Button>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                            <strong>💡 Tip:</strong> Click "Open in Email Client" to compose the email
                            in your default email app, or copy the template to use in your preferred
                            email service.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
