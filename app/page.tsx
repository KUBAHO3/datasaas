import { getCurrentUserContext } from '@/lib/access-control/permissions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const userContext = await getCurrentUserContext();

  if (userContext) {
    if (userContext.isSuperAdmin) {
      redirect('/admin');
    }

    if (userContext.companyId) {
      redirect(`/org/${userContext.companyId}`);
    }

    redirect('/onboarding');
  }

  return (
    <div className="flex min-h-screen flex-col mx-auto">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">DataSaaS</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 mx-auto">
        <section className="container px-6 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Data Collection & Management Made Simple
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Create custom forms, collect data, and manage your organization&apos;s information
              efficiently with our powerful SaaS platform.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/auth/sign-up">
                <Button size="lg">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/auth/sign-in">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container px-6 py-24 md:py-32 bg-muted/50">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              Everything you need to manage data
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Custom Forms</h3>
                <p className="text-muted-foreground">
                  Build dynamic forms with our intuitive drag-and-drop builder
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Data Management</h3>
                <p className="text-muted-foreground">
                  Store, search, and manage your data efficiently and securely
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Analytics & Reports</h3>
                <p className="text-muted-foreground">
                  Generate insights with powerful analytics and custom reports
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}