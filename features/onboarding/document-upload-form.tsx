"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentsSchema, DocumentsInput } from "@/lib/schemas/onboarding-schemas";
import { Button } from "@/components/ui/button";
import { saveDocuments } from "@/lib/services/actions/onboarding.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileUploader } from "@/components/upload/file-uploader";
import { MultiFileUploader } from "@/components/upload/multi-file-uploader";
import { uploadDocument, uploadMultipleDocuments } from "@/lib/services/actions/file-upload.actions";
import { Loader2 } from "lucide-react";

interface DocumentUploadFormProps {
    initialData?: DocumentsInput;
    companyId: string;
}

export function DocumentUploadForm({ initialData, companyId }: DocumentUploadFormProps) {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);

    const [businessRegFile, setBusinessRegFile] = useState<File | null>(null);
    const [taxDocFile, setTaxDocFile] = useState<File | null>(null);
    const [proofAddressFile, setProofAddressFile] = useState<File | null>(null);
    const [certificationFiles, setCertificationFiles] = useState<File[]>([]);

    const form = useForm<DocumentsInput>({
        resolver: zodResolver(documentsSchema),
        defaultValues: initialData || {
            businessRegistrationFileId: "",
            taxDocumentFileId: "",
            proofOfAddressFileId: "",
            certificationsFileIds: [],
        },
    });

    async function handleBusinessRegChange(file: File | null) {
        setBusinessRegFile(file);

        if (file) {
            setIsUploading(true);
            try {
                const result = await uploadDocument({ file, companyId });

                console.log("bbb: ", result)

                if (result?.data?.success) {
                    form.setValue("businessRegistrationFileId", result.data.fileId);
                    toast.success("Business registration uploaded!");
                } else {
                    toast.error(result?.data?.error || "Upload failed");
                    setBusinessRegFile(null);
                }
            } catch (error) {
                toast.error("Upload failed");
                setBusinessRegFile(null);
            } finally {
                setIsUploading(false);
            }
        } else {
            form.setValue("businessRegistrationFileId", "");
        }
    }

    async function handleTaxDocChange(file: File | null) {
        setTaxDocFile(file);

        if (file) {
            setIsUploading(true);
            try {
                const result = await uploadDocument({ file, companyId });

                if (result?.data?.success) {
                    form.setValue("taxDocumentFileId", result.data.fileId);
                    toast.success("Tax document uploaded!");
                } else {
                    toast.error(result?.data?.error || "Upload failed");
                    setTaxDocFile(null);
                }
            } catch (error) {
                toast.error("Upload failed");
                setTaxDocFile(null);
            } finally {
                setIsUploading(false);
            }
        } else {
            form.setValue("taxDocumentFileId", "");
        }
    }

    async function handleProofAddressChange(file: File | null) {
        setProofAddressFile(file);

        if (file) {
            setIsUploading(true);
            try {
                const result = await uploadDocument({ file, companyId });

                if (result?.data?.success) {
                    form.setValue("proofOfAddressFileId", result.data.fileId);
                    toast.success("Proof of address uploaded!");
                } else {
                    toast.error(result?.data?.error || "Upload failed");
                    setProofAddressFile(null);
                }
            } catch (error) {
                toast.error("Upload failed");
                setProofAddressFile(null);
            } finally {
                setIsUploading(false);
            }
        } else {
            form.setValue("proofOfAddressFileId", "");
        }
    }

    async function handleCertificationsChange(files: File[]) {
        setCertificationFiles(files);

        if (files.length > 0) {
            setIsUploading(true);
            try {
                const result = await uploadMultipleDocuments({ files, companyId });

                if (result?.data?.success) {
                    const fileIds = result.data.files.map((f) => f.fileId);
                    form.setValue("certificationsFileIds", fileIds);
                    toast.success(`${files.length} certification(s) uploaded!`);
                } else {
                    toast.error(result?.data?.error || "Upload failed");
                    setCertificationFiles([]);
                }
            } catch (error) {
                toast.error("Upload failed");
                setCertificationFiles([]);
            } finally {
                setIsUploading(false);
            }
        } else {
            form.setValue("certificationsFileIds", []);
        }
    }

    async function onSubmit(data: DocumentsInput) {
        try {
            const result = await saveDocuments(data);

            if (result?.data?.success) {
                toast.success("Documents saved!");
                router.push("/onboarding?step=6");
            } else {
                toast.error(result?.data?.error || "Failed to save documents");
            }
        } catch (error) {
            console.error("Save documents error:", error);
            toast.error("An unexpected error occurred");
        }
    }

    const isSubmitting = form.formState.isSubmitting;

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
                <CardDescription>
                    Upload required business documents for verification
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Business Registration Certificate</FieldLabel>
                            <FieldDescription>
                                Upload your official business registration document (PDF, max 10MB)
                            </FieldDescription>
                            <FileUploader
                                file={businessRegFile}
                                onChange={handleBusinessRegChange}
                                disabled={isUploading}
                            />
                            {form.formState.errors.businessRegistrationFileId && (
                                <FieldError>
                                    {form.formState.errors.businessRegistrationFileId.message}
                                </FieldError>
                            )}
                        </Field>
                    </FieldGroup>

                    <FieldGroup>
                        <Field>
                            <FieldLabel>Tax Document</FieldLabel>
                            <FieldDescription>
                                Upload your tax registration or EIN document (PDF, max 10MB)
                            </FieldDescription>
                            <FileUploader
                                file={taxDocFile}
                                onChange={handleTaxDocChange}
                                disabled={isUploading}
                            />
                            {form.formState.errors.taxDocumentFileId && (
                                <FieldError>{form.formState.errors.taxDocumentFileId.message}</FieldError>
                            )}
                        </Field>
                    </FieldGroup>

                    <FieldGroup>
                        <Field>
                            <FieldLabel>Proof of Business Address</FieldLabel>
                            <FieldDescription>
                                Upload a utility bill or lease agreement (PDF, max 10MB)
                            </FieldDescription>
                            <FileUploader
                                file={proofAddressFile}
                                onChange={handleProofAddressChange}
                                disabled={isUploading}
                            />
                            {form.formState.errors.proofOfAddressFileId && (
                                <FieldError>
                                    {form.formState.errors.proofOfAddressFileId.message}
                                </FieldError>
                            )}
                        </Field>
                    </FieldGroup>

                    <FieldGroup>
                        <Field>
                            <FieldLabel>Professional Certifications (Optional)</FieldLabel>
                            <FieldDescription>
                                Upload any relevant industry certifications (max 5 files, 10MB each)
                            </FieldDescription>
                            <MultiFileUploader
                                files={certificationFiles}
                                onChange={handleCertificationsChange}
                                maxFiles={5}
                                disabled={isUploading}
                            />
                        </Field>
                    </FieldGroup>

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/onboarding?step=4")}
                            disabled={isSubmitting || isUploading}
                            className="flex-1"
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || isUploading}
                            className="flex-1"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Continue"
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}