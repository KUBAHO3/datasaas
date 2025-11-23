"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { submitOnboarding } from "@/lib/services/actions/onboarding.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Building2, MapPin, FileText, CheckCircle2, Edit } from "lucide-react";
import { OnboardingProgress } from "@/lib/types/onboarding-types";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

interface ReviewSubmissionProps {
    progress: OnboardingProgress;
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
                router.push("/pending-approval");
            } else if (result?.serverError) {
                toast.error(result.serverError);
            }
        } catch (error) {
            toast.error("Failed to submit application");
        } finally {
            setIsSubmitting(false);
        }
    }

    const isComplete =
        progress.companyBasicInfo &&
        progress.companyAddress &&
        progress.companyBranding &&
        progress.documents;

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Review Your Application</CardTitle>
                <CardDescription>
                    Please review all information before submitting
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                    {progress.companyBasicInfo ? (
                        <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Company Name:</span>
                                <span className="font-medium">{progress.companyBasicInfo.companyName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Industry:</span>
                                <span className="font-medium">{progress.companyBasicInfo.industry}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Size:</span>
                                <span className="font-medium">{progress.companyBasicInfo.size}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Phone:</span>
                                <span className="font-medium">{progress.companyBasicInfo.phone}</span>
                            </div>
                            {progress.companyBasicInfo.website && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Website:</span>
                                    <span className="font-medium">{progress.companyBasicInfo.website}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-destructive">Not completed</p>
                    )}
                </div>

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
                    {progress.companyAddress ? (
                        <div className="text-sm">
                            <p>{progress.companyAddress.street}</p>
                            <p>{progress.companyAddress.city}, {progress.companyAddress.state} {progress.companyAddress.zipCode}</p>
                            <p>{progress.companyAddress.country}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-destructive">Not completed</p>
                    )}
                </div>

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
                    {progress.companyBranding ? (
                        <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax ID:</span>
                                <span className="font-medium">{progress.companyBranding.taxId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Logo:</span>
                                <span className="font-medium">
                                    {progress.companyBranding.logoFileId ? "Uploaded" : "Not uploaded"}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-destructive">Not completed</p>
                    )}
                </div>

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
                    {progress.documents ? (
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