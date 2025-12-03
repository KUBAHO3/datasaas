import { getCompanyById } from "@/lib/services/actions/company.actions";
import { requireSuperAdmin } from "@/lib/access-control/permissions";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Calendar,
  User,
  FileText,
  Users,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { TeamMembersTable } from "@/features/company/team-members-table";
import Image from "next/image";
import { CompanyActionsBar } from "@/features/admin/company-actions-bar";

interface CompanyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyDetailPage({
  params,
}: CompanyDetailPageProps) {
  await requireSuperAdmin();
  const { id } = await params;

  const result = await getCompanyById(id);

  if (!result) {
    notFound();
  }

  const { company, onboarding, teamMembers } = result;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "suspended":
        return <Ban className="h-5 w-5 text-red-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
      active:
        "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      suspended: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      rejected:
        "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
    };

    return (
      <Badge variant="outline" className={styles[status]}>
        {getStatusIcon(status)}
        <span className="ml-2">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </Badge>
    );
  };

  return (
    <main className="flex-1 p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/companies">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {company.companyName}
              </h1>
              <p className="text-muted-foreground mt-1">
                Company Details & Information
              </p>
            </div>
          </div>

          <CompanyActionsBar company={company} />
        </div>

        {/* Status Banner */}
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Company Status</p>
                <div className="mt-1">{getStatusBadge(company.status)}</div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground">Applied</p>
              <p className="font-medium">
                {format(new Date(company.$createdAt), "MMMM d, yyyy")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Company Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="team">Team Members</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Primary company contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{company.email}</p>
                    </div>
                  </div>

                  {company.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{company.phone}</p>
                      </div>
                    </div>
                  )}

                  {company.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Website</p>
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          {company.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {company.industry && (
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Industry
                        </p>
                        <p className="font-medium">{company.industry}</p>
                      </div>
                    </div>
                  )}

                  {company.size && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Company Size
                        </p>
                        <p className="font-medium">{company.size}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Address Information */}
              {company.address && (
                <Card>
                  <CardHeader>
                    <CardTitle>Address</CardTitle>
                    <CardDescription>
                      Company physical location
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{company.address}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {company.city}, {company.state} {company.zipCode}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {company.country}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Description */}
            {company.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Company Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{company.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Approval Information */}
            {(company.approvedAt || company.rejectedAt) && (
              <Card>
                <CardHeader>
                  <CardTitle>Status Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {company.approvedAt && (
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Approved On
                        </p>
                        <p className="font-medium">
                          {format(
                            new Date(company.approvedAt),
                            "MMMM d, yyyy 'at' h:mm a"
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {company.rejectedAt && (
                    <>
                      <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Rejected On
                          </p>
                          <p className="font-medium">
                            {format(
                              new Date(company.rejectedAt),
                              "MMMM d, yyyy 'at' h:mm a"
                            )}
                          </p>
                        </div>
                      </div>

                      {company.rejectionReason && (
                        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 p-4">
                          <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                            Rejection Reason:
                          </p>
                          <p className="text-sm text-red-800 dark:text-red-200">
                            {company.rejectionReason}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Company Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Complete Company Information</CardTitle>
                <CardDescription>
                  All details from onboarding process
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {onboarding?.logoFileId && (
                  <div>
                    <p className="text-sm font-medium mb-3">Company Logo</p>
                    <Image
                      src={`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_IMAGES_BUCKET_ID}/files/${onboarding.logoFileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`}
                      alt="Company Logo"
                      width={150}
                      height={150}
                      className="rounded-lg border"
                    />
                  </div>
                )}

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Tax ID</p>
                    <p className="text-muted-foreground">
                      {onboarding?.taxId || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Team ID</p>
                    <p className="text-muted-foreground">
                      {company.teamId || "Not created yet"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Documents</CardTitle>
                <CardDescription>
                  Business registration and verification documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {onboarding?.businessRegistrationFileId && (
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">
                          Business Registration Certificate
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Required document
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_DOCUMENTS_BUCKET_ID}/files/${onboarding.businessRegistrationFileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    </Button>
                  </div>
                )}

                {onboarding?.taxDocumentFileId && (
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Tax Document</p>
                        <p className="text-xs text-muted-foreground">
                          Required document
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_DOCUMENTS_BUCKET_ID}/files/${onboarding.taxDocumentFileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    </Button>
                  </div>
                )}

                {onboarding?.proofOfAddressFileId && (
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Proof of Address</p>
                        <p className="text-xs text-muted-foreground">
                          Required document
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_DOCUMENTS_BUCKET_ID}/files/${onboarding.proofOfAddressFileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    </Button>
                  </div>
                )}

                {onboarding?.certificationsFileIds &&
                  onboarding.certificationsFileIds.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium mb-3">
                          Professional Certifications
                        </p>
                        <div className="space-y-2">
                          {onboarding.certificationsFileIds.map(
                            (fileId, index) => (
                              <div
                                key={fileId}
                                className="flex items-center justify-between rounded-lg border p-3"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <p className="text-sm">
                                    Certification {index + 1}
                                  </p>
                                </div>
                                <Button size="sm" variant="ghost" asChild>
                                  <a
                                    href={`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_DOCUMENTS_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View
                                  </a>
                                </Button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </>
                  )}

                {!onboarding?.businessRegistrationFileId &&
                  !onboarding?.taxDocumentFileId &&
                  !onboarding?.proofOfAddressFileId && (
                    <p className="text-center text-muted-foreground py-8">
                      No documents uploaded
                    </p>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Members Tab */}
          <TabsContent value="team">
            <TeamMembersTable members={teamMembers} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}