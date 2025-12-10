import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSessionModel } from "@/lib/services/models/form.model";
import { formatDistanceToNow } from "date-fns";
import { FileText, Edit, Eye, MoreVertical, Archive, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormActionButtons } from "./form-action-buttons";

interface FormsListProps {
    orgId: string;
}

export async function FormsList({ orgId }: FormsListProps) {
    const formModel = new FormSessionModel();
    const forms = await formModel.listByCompany(orgId);

    if (forms.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No forms yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Create your first form to start collecting data
                    </p>
                    <Button asChild>
                        <Link href={`/org/${orgId}/forms/create`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Your First Form
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const draftForms = forms.filter((f) => f.status === "draft");
    const publishedForms = forms.filter((f) => f.status === "published");
    const archivedForms = forms.filter((f) => f.status === "archived");

    return (
        <div className="space-y-6">
            {publishedForms.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Published Forms</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {publishedForms.map((form) => (
                            <FormCard key={form.$id} form={form} orgId={orgId} />
                        ))}
                    </div>
                </div>
            )}

            {draftForms.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Drafts</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {draftForms.map((form) => (
                            <FormCard key={form.$id} form={form} orgId={orgId} />
                        ))}
                    </div>
                </div>
            )}

            {archivedForms.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Archived</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {archivedForms.map((form) => (
                            <FormCard key={form.$id} form={form} orgId={orgId} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function FormCard({ form, orgId }: { form: any; orgId: string }) {
    const statusColors = {
        draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
        published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        archived: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg line-clamp-1">{form.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                            {form.description || "No description"}
                        </CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/org/${orgId}/forms/${form.$id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/org/${orgId}/forms/${form.$id}/preview`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Preview
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <FormActionButtons formId={form.$id} status={form.status} orgId={orgId} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <Badge className={statusColors[form.status as keyof typeof statusColors]}>
                        {form.status}
                    </Badge>
                    <span className="text-muted-foreground">
                        v{form.version}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Fields</p>
                        <p className="font-medium">{form.fields?.length || 0}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Responses</p>
                        <p className="font-medium">{form.metadata?.responseCount || 0}</p>
                    </div>
                </div>

                <div className="text-xs text-muted-foreground">
                    Updated {formatDistanceToNow(new Date(form.$updatedAt), { addSuffix: true })}
                </div>

                <Button asChild className="w-full" variant="outline">
                    <Link href={`/org/${orgId}/forms/${form.$id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        {form.status === "draft" ? "Continue Editing" : "Edit Form"}
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}