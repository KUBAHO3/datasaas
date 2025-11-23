"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentsSchema, DocumentsInput } from "@/lib/schemas/onboarding-schemas";
import { Upload, FileText, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveDocuments } from "@/lib/services/actions/onboarding.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DocumentUploadFormProps {
    initialData?: DocumentsInput;
}

interface UploadedFile {
    id: string;
    name: string;
    size: number;
}

export function DocumentUploadForm({ initialData }: any) {
    const router = useRouter();
    const [businessReg, setBusinessReg] = useState<UploadedFile | null>(null);
    const [taxDoc, setTaxDoc] = useState<UploadedFile | null>(null);
    const [proofAddress, setProofAddress] = useState<UploadedFile | null>(null);
    const [certifications, setCertifications] = useState<UploadedFile[]>([]);

    const form = useForm<DocumentsInput>({
        resolver: zodResolver(documentsSchema),
        defaultValues: initialData || {
            businessRegistration: "",
            taxDocument: "",
            proofOfAddress: "",
            certifications: [],
        },
    });

    async function handleFileUpload(
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'business' | 'tax' | 'proof' | 'cert'
    ) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate PDF
        if (file.type !== 'application/pdf') {
            toast.error("Only PDF files are allowed");
            return;
        }

        // Validate size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        // In production, upload to Appwrite Storage here
        // const uploadedFile = await uploadToAppwriteStorage(file);

        const mockFileId = `file_${Date.now()}`;
        const uploadedFile: UploadedFile = {
            id: mockFileId,
            name: file.name,
            size: file.size,
        };

        switch (type) {
            case 'business':
                setBusinessReg(uploadedFile);
                form.setValue('businessRegistration', mockFileId);
                break;
            case 'tax':
                setTaxDoc(uploadedFile);
                form.setValue('taxDocument', mockFileId);
                break;
            case 'proof':
                setProofAddress(uploadedFile);
                form.setValue('proofOfAddress', mockFileId);
                break;
            case 'cert':
                const newCerts = [...certifications, uploadedFile];
                setCertifications(newCerts);
                form.setValue('certifications', newCerts.map(c => c.id));
                break;
        }

        toast.success(`${file.name} uploaded successfully!`);
    }

    function removeFile(type: 'business' | 'tax' | 'proof', index?: number) {
        switch (type) {
            case 'business':
                setBusinessReg(null);
                form.setValue('businessRegistration', '');
                break;
            case 'tax':
                setTaxDoc(null);
                form.setValue('taxDocument', '');
                break;
            case 'proof':
                setProofAddress(null);
                form.setValue('proofOfAddress', '');
                break;
        }
    }

    async function onSubmit(data: DocumentsInput) {
        try {
            const result = await saveDocuments(data);

            if (result?.data?.success) {
                toast.success("Documents saved!");
                router.push("/onboarding/step-6");
            } else if (result?.serverError) {
                toast.error(result.serverError);
            }
        } catch (error) {
            toast.error("Failed to save documents");
        }
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Document Upload</CardTitle>
                <CardDescription>
                    Upload required company documents (PDF only, max 5MB each)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                            name="businessRegistration"
                            control={form.control}
                            render={({ fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Business Registration Certificate *</FieldLabel>
                                    <FieldDescription>
                                        Upload your official business registration document
                                    </FieldDescription>

                                    {businessReg ? (
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                <div>
                                                    <p className="text-sm font-medium">{businessReg.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(businessReg.size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => removeFile('business')}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer">
                                            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-input p-8 hover:bg-accent/50 transition">
                                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                                <p className="text-sm font-medium">Click to upload</p>
                                                <p className="text-xs text-muted-foreground">PDF only, max 5MB</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="application/pdf"
                                                onChange={(e) => handleFileUpload(e, 'business')}
                                            />
                                        </label>
                                    )}
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="taxDocument"
                            control={form.control}
                            render={({ fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Tax Identification Document *</FieldLabel>
                                    <FieldDescription>
                                        Upload your tax ID or EIN certificate
                                    </FieldDescription>

                                    {taxDoc ? (
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                <div>
                                                    <p className="text-sm font-medium">{taxDoc.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(taxDoc.size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => removeFile('tax')}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer">
                                            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-input p-8 hover:bg-accent/50 transition">
                                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                                <p className="text-sm font-medium">Click to upload</p>
                                                <p className="text-xs text-muted-foreground">PDF only, max 5MB</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="application/pdf"
                                                onChange={(e) => handleFileUpload(e, 'tax')}
                                            />
                                        </label>
                                    )}
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="proofOfAddress"
                            control={form.control}
                            render={({ fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Proof of Address *</FieldLabel>
                                    <FieldDescription>
                                        Utility bill, lease agreement, or similar document
                                    </FieldDescription>

                                    {proofAddress ? (
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                <div>
                                                    <p className="text-sm font-medium">{proofAddress.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(proofAddress.size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => removeFile('proof')}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer">
                                            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-input p-8 hover:bg-accent/50 transition">
                                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                                <p className="text-sm font-medium">Click to upload</p>
                                                <p className="text-xs text-muted-foreground">PDF only, max 5MB</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="application/pdf"
                                                onChange={(e) => handleFileUpload(e, 'proof')}
                                            />
                                        </label>
                                    )}
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    <div className="flex justify-between mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/onboarding/step-4")}
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? "Saving..." : "Continue to Review"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}