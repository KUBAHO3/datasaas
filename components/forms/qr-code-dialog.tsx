"use client";

import { useEffect, useState, useCallback } from "react";
import QRCode from "qrcode";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";

interface QRCodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    url: string;
    formTitle: string;
}

export function QRCodeDialog({ open, onOpenChange, url, formTitle }: QRCodeDialogProps) {
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);

    const generateQRCode = useCallback(async () => {
        if (!url) {
            console.warn("URL not available");
            return;
        }

        setIsGenerating(true);
        try {
            const dataUrl = await QRCode.toDataURL(url, {
                width: 300,
                margin: 2,
                errorCorrectionLevel: 'M',
                color: {
                    dark: "#000000",
                    light: "#FFFFFF",
                },
            });
            setQrCodeDataUrl(dataUrl);
            console.log("QR code generated successfully");
        } catch (error) {
            console.error("Error generating QR code:", error);
            toast.error("Failed to generate QR code");
        } finally {
            setIsGenerating(false);
        }
    }, [url]);

    useEffect(() => {
        if (open) {
            generateQRCode();
        }
    }, [open, generateQRCode]);

    function downloadQRCode() {
        if (!qrCodeDataUrl) return;

        try {
            const link = document.createElement("a");
            const sanitizedTitle = (formTitle || "form").replace(/[^a-z0-9]/gi, "-").toLowerCase();
            link.download = `${sanitizedTitle}-qr-code.png`;
            link.href = qrCodeDataUrl;
            link.click();
            toast.success("QR code downloaded successfully!");
        } catch (error) {
            console.error("Error downloading QR code:", error);
            toast.error("Failed to download QR code");
        }
    }

    async function shareQRCode() {
        if (!qrCodeDataUrl) return;

        try {
            // Convert data URL to blob
            const response = await fetch(qrCodeDataUrl);
            const blob = await response.blob();

            const sanitizedTitle = (formTitle || "form").replace(/[^a-z0-9]/gi, "-").toLowerCase();
            const file = new File([blob], `${sanitizedTitle}-qr-code.png`, {
                type: "image/png",
            });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: formTitle || "Form",
                        text: `Scan this QR code to access: ${formTitle || "this form"}`,
                    });
                    toast.success("QR code shared successfully!");
                } catch (error) {
                    if ((error as Error).name !== "AbortError") {
                        console.error("Error sharing:", error);
                        toast.error("Failed to share QR code");
                    }
                }
            } else {
                // Fallback: Copy image to clipboard
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            "image/png": blob,
                        }),
                    ]);
                    toast.success("QR code copied to clipboard!");
                } catch (error) {
                    console.error("Error copying to clipboard:", error);
                    toast.error("Failed to copy QR code to clipboard");
                }
            }
        } catch (error) {
            console.error("Error sharing QR code:", error);
            toast.error("Failed to share QR code");
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>QR Code for Form</DialogTitle>
                    <DialogDescription>
                        Scan this QR code to access the form directly
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4">
                    <div className="bg-white p-4 rounded-lg border flex items-center justify-center min-h-[316px]">
                        {isGenerating ? (
                            <div className="text-sm text-muted-foreground">Generating QR code...</div>
                        ) : qrCodeDataUrl ? (
                            <img
                                src={qrCodeDataUrl}
                                alt="QR Code"
                                width={300}
                                height={300}
                                className="max-w-full h-auto"
                            />
                        ) : (
                            <div className="text-sm text-muted-foreground">QR code not available</div>
                        )}
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-muted-foreground break-all">{url}</p>
                    </div>

                    <div className="flex gap-2 w-full">
                        <Button
                            onClick={downloadQRCode}
                            className="flex-1"
                            disabled={isGenerating || !qrCodeDataUrl}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                        <Button
                            onClick={shareQRCode}
                            variant="outline"
                            className="flex-1"
                            disabled={isGenerating || !qrCodeDataUrl}
                        >
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                        </Button>
                    </div>

                    <div className="text-xs text-muted-foreground text-center">
                        Print this QR code or share it on promotional materials to make your form
                        easily accessible.
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
