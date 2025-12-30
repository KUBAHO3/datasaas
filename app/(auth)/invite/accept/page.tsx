import { AcceptInvitationCard } from "@/features/auth/accept-invitation-card";

interface AcceptInvitePageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
  const params = await searchParams;

  // Validate required parameters
  const { token } = params;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4">
        <div className="w-full sm:max-w-md bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-destructive mb-4">Invalid Invitation Link</h1>
          <p className="text-muted-foreground mb-6">
            This invitation link appears to be invalid or incomplete. Please check your email for the correct link
            or contact your team administrator for a new invitation.
          </p>
          <a
            href="/auth/sign-in"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  return <AcceptInvitationCard token={token} />;
}

export const metadata = {
  title: "Accept Invitation",
  description: "Accept your team invitation and create your account",
};
