import { Building2, Calendar, CheckCircle2, Mail, Phone, User, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCompanyById } from "@/lib/services/actions/company.actions";
import { ResendNotificationButton } from "@/features/admin/resend-notification-button";
import EditCompanyDialog from "@/features/admin/edit-company-dialog";
import DeleteCompanyDialog from "@/features/admin/delete-company-dialog";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CompanyDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const company = await getCompanyById(id);

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 text-destructive mb-2">
              <AlertCircle className="h-5 w-5" />
              <CardTitle className="text-2xl">Company Not Found</CardTitle>
            </div>
            <CardDescription>
              The company you're looking for doesn't exist or has been deleted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Company ID: <code className="bg-muted px-1 py-0.5 rounded text-xs">{id}</code>
              </AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Button asChild>
                <Link href="/admin/companies">
                  Back to Companies List
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "suspended":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{company.companyName}</h1>
          <p className="text-muted-foreground">Company Details & Management</p>
        </div>
        <div className="flex gap-2">
          <ResendNotificationButton company={company} />
          <EditCompanyDialog company={company} />
          <DeleteCompanyDialog company={company} redirectAfterDelete />
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <Badge className={getStatusColor(company.status)} variant="outline">
          {company.status === "active" && <CheckCircle2 className="h-3 w-3 mr-1" />}
          {company.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
          {company.status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Company profile and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Company Name</p>
                <p className="text-sm text-muted-foreground">{company.companyName}</p>
              </div>
            </div>

            {company.industry && (
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Industry</p>
                  <p className="text-sm text-muted-foreground">{company.industry}</p>
                </div>
              </div>
            )}

            {company.size && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Company Size</p>
                  <p className="text-sm text-muted-foreground">{company.size}</p>
                </div>
              </div>
            )}

            {company.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{company.email}</p>
                </div>
              </div>
            )}

            {company.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{company.phone}</p>
                </div>
              </div>
            )}

            {company.website && (
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Website</p>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              </div>
            )}

            {company.description && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm text-muted-foreground">{company.description}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
            <CardDescription>Company location details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {company.address && <p className="text-sm">{company.address}</p>}
            {company.city && (
              <p className="text-sm">
                {company.city}
                {company.state && `, ${company.state}`}
                {company.zipCode && ` ${company.zipCode}`}
              </p>
            )}
            {company.country && <p className="text-sm font-medium">{company.country}</p>}
          </CardContent>
        </Card>

        {/* Status History */}
        <Card>
          <CardHeader>
            <CardTitle>Status History</CardTitle>
            <CardDescription>Company approval and status timeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(company.$createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {company.approvedAt && (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Approved</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(company.approvedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            {company.rejectedAt && (
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Rejected</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(company.rejectedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {company.rejectionReason && (
                    <p className="text-sm text-muted-foreground mt-1 italic">
                      Reason: {company.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
            <CardDescription>Appwrite team and access details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {company.teamId ? (
              <>
                <div>
                  <p className="text-sm font-medium">Team ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{company.teamId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-green-600">Team Created</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No team created yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}