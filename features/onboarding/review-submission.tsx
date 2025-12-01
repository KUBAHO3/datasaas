"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { submitOnboarding } from "@/lib/services/actions/onboarding.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Building2, MapPin, FileText, CheckCircle2, Edit } from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { OnboardingProgressWithArrays } from "@/lib/types/onboarding-types";

interface ReviewSubmissionProps {
    progress: OnboardingProgressWithArrays;
}

export function ReviewSubmission({ progress }: ReviewSubmissionProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit() {
        setIsSubmitting(true);
        try {
            const result = await submitOnboarding();

            if (result?.data?.success) {
                toast.success("Application submitted successfully!", {
                    description: "Your application is now under review."
                });
                router.push("/onboarding/pending-approval");
            } else if (result?.serverError) {
                toast.error(result.serverError);
            }
        } catch (error) {
            toast.error("Failed to submit application");
        } finally {
            setIsSubmitting(false);
        }
    }

    // Check if all required fields are complete
    const isCompanyBasicInfoComplete = Boolean(
        progress.companyName &&
        progress.industry &&
        progress.size &&
        progress.phone
    );

    const isCompanyAddressComplete = Boolean(
        progress.street &&
        progress.city &&
        progress.state &&
        progress.country &&
        progress.zipCode
    );

    const isCompanyBrandingComplete = Boolean(
        progress.taxId
    );

    const isDocumentsComplete = Boolean(
        progress.businessRegistrationFileId &&
        progress.taxDocumentFileId &&
        progress.proofOfAddressFileId
    );

    const isComplete =
        isCompanyBasicInfoComplete &&
        isCompanyAddressComplete &&
        isCompanyBrandingComplete &&
        isDocumentsComplete;

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Review Your Application</CardTitle>
                <CardDescription>
                    Please review all information before submitting
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Company Information */}
                <div className="rounded-lg border p-4">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Company Information</h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/onboarding/step-2")}
                        >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                    </div>
                    {isCompanyBasicInfoComplete ? (
                        <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Company Name:</span>
                                <span className="font-medium">{progress.companyName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Industry:</span>
                                <span className="font-medium">{progress.industry}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Size:</span>
                                <span className="font-medium">{progress.size}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Phone:</span>
                                <span className="font-medium">{progress.phone}</span>
                            </div>
                            {progress.website && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Website:</span>
                                    <span className="font-medium">{progress.website}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-destructive">Not completed</p>
                    )}
                </div>

                {/* Company Address */}
                <div className="rounded-lg border p-4">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Company Address</h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/onboarding/step-3")}
                        >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                    </div>
                    {isCompanyAddressComplete ? (
                        <div className="text-sm">
                            <p>{progress.street}</p>
                            <p>{progress.city}, {progress.state} {progress.zipCode}</p>
                            <p>{progress.country}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-destructive">Not completed</p>
                    )}
                </div>

                {/* Branding & Tax Information */}
                <div className="rounded-lg border p-4">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Branding & Tax Information</h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/onboarding/step-4")}
                        >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                    </div>
                    {isCompanyBrandingComplete ? (
                        <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax ID:</span>
                                <span className="font-medium">{progress.taxId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Logo:</span>
                                <span className="font-medium">
                                    {progress.logoFileId ? "Uploaded" : "Not uploaded"}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-destructive">Not completed</p>
                    )}
                </div>

                {/* Required Documents */}
                <div className="rounded-lg border p-4">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Required Documents</h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/onboarding/step-5")}
                        >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                    </div>
                    {isDocumentsComplete ? (
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span>Business Registration Certificate</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span>Tax Identification Document</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span>Proof of Address</span>
                            </div>
                            {progress.certificationsFileIds && progress.certificationsFileIds.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span>{progress.certificationsFileIds.length} Certification(s)</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-destructive">Not completed</p>
                    )}
                </div>

                <Separator />

                {!isComplete && (
                    <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 p-4">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Please complete all steps before submitting your application.
                        </p>
                    </div>
                )}

                <div className="flex justify-between mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/onboarding/step-5")}
                    >
                        Back
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!isComplete || isSubmitting}
                    >
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}