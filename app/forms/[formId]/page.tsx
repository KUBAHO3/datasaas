import { FormAdminModel } from "@/lib/services/models/form.model";
import { notFound } from "next/navigation";
import { getCurrentUserContext } from "@/lib/access-control/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FormRenderer } from "@/features/forms/form-renderer";

export const dynamic = 'force-dynamic';

interface PublicFormPageProps {
    params: Promise<{ formId: string }>;
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
    const { formId } = await params;

    const formModel = new FormAdminModel();
    const form = await formModel.findById(formId);

    if (!form) {
        notFound();
    }

    if (form.status !== "published") {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-muted/20">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-orange-600 mb-2">
                            <AlertCircle className="h-5 w-5" />
                            <CardTitle>Form Not Available</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            This form is not currently accepting responses.
                        </p>
                        {form.status === "draft" && (
                            <p className="text-sm text-muted-foreground">
                                The form is still in draft mode and hasn't been published yet.
                            </p>
                        )}
                        {form.status === "archived" && (
                            <p className="text-sm text-muted-foreground">
                                The form has been archived and is no longer accepting submissions.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    const userContext = await getCurrentUserContext();

    const isPublicForm =
        form.accessControl.visibility === "public" || form.settings.isPublic;

    if (!isPublicForm) {
        if (!userContext) {
            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-muted/20">
                    <Card className="max-w-md w-full">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-blue-600 mb-2">
                                <AlertCircle className="h-5 w-5" />
                                <CardTitle>Sign In Required</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                This form is private. You need to sign in to access it.
                            </p>
                            <Button asChild className="w-full">
                                <Link href={`/auth/sign-in?returnTo=/forms/${formId}`}>
                                    Sign In
                                </Link>
                            </Button>
                            <div className="text-center">
                                <Link
                                    href="/auth/sign-up"
                                    className="text-sm text-muted-foreground hover:text-foreground"
                                >
                                    Don't have an account? Sign up
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )
        }

        const hasAccess =
            userContext.companyId === form.companyId ||
            userContext.isSuperAdmin;

        if (!hasAccess) {
            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-muted/20">
                    <Card className="max-w-md w-full">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-red-600 mb-2">
                                <AlertCircle className="h-5 w-5" />
                                <CardTitle>Access Denied</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                You don't have permission to access this form. This form is
                                restricted to specific team members.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            );
        }
    }

    if (!isPublicForm && !userContext) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-muted/20">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <AlertCircle className="h-5 w-5" />
                            <CardTitle>Sign In Required</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            You need to sign in to submit this form.
                        </p>
                        <Button asChild className="w-full">
                            <Link href={`/auth/sign-in?returnTo=/forms/${formId}`}>
                                Sign In
                            </Link>
                        </Button>
                        <div className="text-center">
                            <Link
                                href="/auth/sign-up"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Don't have an account? Sign up
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (
        form.accessControl.maxSubmissions &&
        form.metadata.responseCount >= form.accessControl.maxSubmissions
    ) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-muted/20">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-orange-600 mb-2">
                            <AlertCircle className="h-5 w-5" />
                            <CardTitle>Form Closed</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            This form has reached its maximum number of submissions ({form.accessControl.maxSubmissions}) and is no longer
                            accepting responses.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (
        form.accessControl.expiresAt &&
        new Date(form.accessControl.expiresAt) < new Date()
    ) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-muted/20">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-orange-600 mb-2">
                            <AlertCircle className="h-5 w-5" />
                            <CardTitle>Form Expired</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            This form expired on{" "}
                            {new Date(form.accessControl.expiresAt).toLocaleDateString()} and is
                            no longer accepting responses.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <FormRenderer form={form} userContext={userContext} />;
}