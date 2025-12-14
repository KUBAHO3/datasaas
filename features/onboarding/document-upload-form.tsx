"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentsSchema, DocumentsInput } from "@/lib/schemas/onboarding-schemas";
import { Button } from "@/components/ui/button";
import { saveDocuments, updateDocumentFileId, updateCertificationFileIds, clearDocumentFileId } from "@/lib/services/actions/onboarding.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FileUploader } from "@/components/upload/file-uploader";
import { MultiFileUploader, ExistingFile } from "@/components/upload/multi-file-uploader";
import { Loader2 } from "lucide-react";
import { Organization } from "@/lib/types/appwrite.types";

interface DocumentUploadFormProps {
    initialData?: Organization;
    companyId: string;
}

export function DocumentUploadForm({ initialData, companyId }: DocumentUploadFormProps) {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);

    const [businessRegFile, setBusinessRegFile] = useState<File | string | null>(null);
    const [taxDocFile, setTaxDocFile] = useState<File | string | null>(null);
    const [proofAddressFile, setProofAddressFile] = useState<File | string | null>(null);
    const [certificationFiles, setCertificationFiles] = useState<File[]>([]);
    const [existingCertifications, setExistingCertifications] = useState<ExistingFile[]>([]);

    const form = useForm<DocumentsInput>({
        resolver: zodResolver(documentsSchema),
        defaultValues: {
            businessRegistrationFileId: initialData?.businessRegistrationFileId || "",
            taxDocumentFileId: initialData?.taxDocumentFileId || "",
            proofOfAddressFileId: initialData?.proofOfAddressFileId || "",
            certificationsFileIds: initialData?.certificationsFileIds || [],
        },
    });

    useEffect(() => {
        async function loadExistingFiles() {
            if (!initialData) return;

            setIsLoadingFiles(true);
            try {
                if (initialData.businessRegistrationFileId) {
                    const response = await fetch(`/api/upload/document/${initialData.businessRegistrationFileId}`);
                    const result = await response.json();
                    if (result?.success) {
                        setBusinessRegFile(result.file.fileName);
                    }
                }

                if (initialData.taxDocumentFileId) {
                    const response = await fetch(`/api/upload/document/${initialData.taxDocumentFileId}`);
                    const result = await response.json();
                    if (result?.success) {
                        setTaxDocFile(result.file.fileName);
                    }
                }

                if (initialData.proofOfAddressFileId) {
                    const response = await fetch(`/api/upload/document/${initialData.proofOfAddressFileId}`);
                    const result = await response.json();
                    if (result?.success) {
                        setProofAddressFile(result.file.fileName);
                    }
                }

                if (initialData.certificationsFileIds && initialData.certificationsFileIds.length > 0) {
                    const filePromises = initialData.certificationsFileIds.map(async (fileId) => {
                        const response = await fetch(`/api/upload/document/${fileId}`);
                        const result = await response.json();
                        if (result?.success) {
                            return {
                                fileId: fileId,
                                fileName: result.file.fileName,
                                fileSize: result.file.fileSize,
                            } as ExistingFile;
                        }
                        return null;
                    });

                    const files = await Promise.all(filePromises);
                    const validFiles = files.filter((f): f is ExistingFile => f !== null);
                    setExistingCertifications(validFiles);
                    console.log("✅ Loaded existing certifications:", validFiles);
                }
            } catch (error) {
                console.error("Failed to load existing files:", error);
            } finally {
                setIsLoadingFiles(false);
            }
        }

        loadExistingFiles();
    }, [initialData]);

    async function handleBusinessRegChange(file: File | null) {
        if (file) {
            setBusinessRegFile(file);
            setIsUploading(true);
            try {
                // ✅ Create FormData
                const formData = new FormData();
                formData.append("file", file);
                formData.append("companyId", companyId);

                // ✅ Call API route instead of server action
                const response = await fetch("/api/upload/document", {
                    method: "POST",
                    body: formData,
                });

                console.log("📡 Response status:", response.status, response.statusText);

                // Check if response is JSON before parsing
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    const text = await response.text();
                    console.error("❌ Non-JSON response:", text.substring(0, 500));
                    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                console.log("📤 Business Registration Upload Result:", result);

                if (result?.success) {
                    form.setValue("businessRegistrationFileId", result.fileId);

                    await updateDocumentFileId({
                        field: "businessRegistrationFileId",
                        fileId: result.fileId,
                    }).catch(err => {
                        console.error("Auto-save failed:", err);
                    });

                    toast.success("Business registration uploaded!");
                } else {
                    toast.error(result?.error || "Upload failed");
                    setBusinessRegFile(null);
                }
            } catch (error) {
                console.error("Upload error:", error);
                toast.error(error instanceof Error ? error.message : "Upload failed");
                setBusinessRegFile(null);
            } finally {
                setIsUploading(false);
            }
        } else {
            const currentFileId = form.getValues("businessRegistrationFileId");

            if (currentFileId) {
                setIsUploading(true);
                try {
                    const deleteResponse = await fetch(`/api/upload/document/${currentFileId}`, {
                        method: "DELETE",
                    });

                    if (deleteResponse.ok) {
                        console.log("🗑️ File deleted from storage:", currentFileId);

                        await clearDocumentFileId({
                            field: "businessRegistrationFileId",
                        });

                        toast.success("File removed successfully");
                    }
                } catch (error) {
                    console.error("Failed to delete file:", error);
                    toast.error("Failed to remove file");
                } finally {
                    setIsUploading(false);
                }
            }

            setBusinessRegFile(null);
            form.setValue("businessRegistrationFileId", "");
        }
    }

    async function handleTaxDocChange(file: File | null) {
        if (file) {
            setTaxDocFile(file);
            setIsUploading(true);
            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("companyId", companyId);

                const response = await fetch("/api/upload/document", {
                    method: "POST",
                    body: formData,
                });


                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    const text = await response.text();
                    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                console.log("📤 Tax Document Upload Result:", result);

                if (result?.success) {
                    form.setValue("taxDocumentFileId", result.fileId);

                    await updateDocumentFileId({
                        field: "taxDocumentFileId",
                        fileId: result.fileId,
                    }).catch(err => {
                        console.error("Auto-save failed:", err);
                    });

                    toast.success("Tax document uploaded!");
                } else {
                    toast.error(result?.error || "Upload failed");
                    setTaxDocFile(null);
                }
            } catch (error) {
                console.error("Upload error:", error);
                toast.error(error instanceof Error ? error.message : "Upload failed");
                setTaxDocFile(null);
            } finally {
                setIsUploading(false);
            }
        } else {
            const currentFileId = form.getValues("taxDocumentFileId");

            if (currentFileId) {
                setIsUploading(true);
                try {
                    const deleteResponse = await fetch(`/api/upload/document/${currentFileId}`, {
                        method: "DELETE",
                    });

                    if (deleteResponse.ok) {

                        await clearDocumentFileId({
                            field: "taxDocumentFileId",
                        });

                        toast.success("File removed successfully");
                    }
                } catch (error) {
                    console.error("Failed to delete file:", error);
                    toast.error("Failed to remove file");
                } finally {
                    setIsUploading(false);
                }
            }

            setTaxDocFile(null);
            form.setValue("taxDocumentFileId", "");
        }
    }

    async function handleProofAddressChange(file: File | null) {
        if (file) {
            setProofAddressFile(file);
            setIsUploading(true);
            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("companyId", companyId);

                const response = await fetch("/api/upload/document", {
                    method: "POST",
                    body: formData,
                });

                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    const text = await response.text();
                    console.error("❌ Non-JSON response:", text.substring(0, 500));
                    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();

                if (result?.success) {
                    form.setValue("proofOfAddressFileId", result.fileId);

                    await updateDocumentFileId({
                        field: "proofOfAddressFileId",
                        fileId: result.fileId,
                    }).catch(err => {
                        console.error("Auto-save failed:", err);
                    });

                    toast.success("Proof of address uploaded!");
                } else {
                    toast.error(result?.error || "Upload failed");
                    setProofAddressFile(null);
                }
            } catch (error) {
                console.error("Upload error:", error);
                toast.error(error instanceof Error ? error.message : "Upload failed");
                setProofAddressFile(null);
            } finally {
                setIsUploading(false);
            }
        } else {
            const currentFileId = form.getValues("proofOfAddressFileId");

            if (currentFileId) {
                setIsUploading(true);
                try {
                    const deleteResponse = await fetch(`/api/upload/document/${currentFileId}`, {
                        method: "DELETE",
                    });

                    if (deleteResponse.ok) {
                        await clearDocumentFileId({
                            field: "proofOfAddressFileId",
                        });

                        toast.success("File removed successfully");
                    }
                } catch (error) {
                    console.error("Failed to delete file:", error);
                    toast.error("Failed to remove file");
                } finally {
                    setIsUploading(false);
                }
            }

            setProofAddressFile(null);
            form.setValue("proofOfAddressFileId", "");
        }
    }

    async function handleCertificationsChange(files: File[]) {
        setCertificationFiles(files);

        if (files.length > 0) {
            setIsUploading(true);
            try {
                const formData = new FormData();
                files.forEach((file) => formData.append("files", file));
                formData.append("companyId", companyId);

                const response = await fetch("/api/upload/documents", {
                    method: "POST",
                    body: formData,
                });

                const result = await response.json();

                if (result?.success) {
                    const uploadedFiles: ExistingFile[] = result.files.map((f: { fileId: string; fileName: string; fileSize: number }) => ({
                        fileId: f.fileId,
                        fileName: f.fileName,
                        fileSize: f.fileSize,
                    }));

                    setExistingCertifications(prev => [...prev, ...uploadedFiles]);

                    setCertificationFiles([]);

                    const allFileIds = [...existingCertifications.map(f => f.fileId), ...uploadedFiles.map(f => f.fileId)];
                    form.setValue("certificationsFileIds", allFileIds);

                    await updateCertificationFileIds({
                        fileIds: allFileIds,
                    }).catch(err => {
                        console.error("Auto-save certifications failed:", err);
                    });

                    toast.success(`${files.length} certification(s) uploaded!`);
                } else {
                    toast.error(result?.error || "Upload failed");
                    setCertificationFiles([]);
                }
            } catch (error) {
                toast.error("Upload failed");
                setCertificationFiles([]);
            } finally {
                setIsUploading(false);
            }
        }
    }

    async function handleRemoveCertification(fileId: string) {
        try {
            const deleteResponse = await fetch(`/api/upload/document/${fileId}`, {
                method: "DELETE",
            });

            if (deleteResponse.ok) {
                console.log("🗑️ Certification file deleted:", fileId);

                setExistingCertifications(prev => prev.filter(f => f.fileId !== fileId));

                const remainingFileIds = existingCertifications
                    .filter(f => f.fileId !== fileId)
                    .map(f => f.fileId);

                form.setValue("certificationsFileIds", remainingFileIds);

                await updateCertificationFileIds({
                    fileIds: remainingFileIds,
                });

                toast.success("Certification removed successfully");
            } else {
                throw new Error("Delete failed");
            }
        } catch (error) {
            console.error("Failed to remove certification:", error);
            throw error;
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
                                disabled={isUploading || isLoadingFiles}
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
                                disabled={isUploading || isLoadingFiles}
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
                                disabled={isUploading || isLoadingFiles}
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
                                existingFiles={existingCertifications}
                                onChange={handleCertificationsChange}
                                onRemoveExisting={handleRemoveCertification}
                                maxFiles={5}
                                disabled={isUploading || isLoadingFiles}
                            />
                        </Field>
                    </FieldGroup>

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/onboarding?step=4")}
                            disabled={isSubmitting || isUploading || isLoadingFiles}
                            className="flex-1"
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || isUploading || isLoadingFiles}
                            className="flex-1"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : isLoadingFiles ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Loading files...
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