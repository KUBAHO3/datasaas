import { requireAuth } from '@/lib/access-control/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

async function DashboardPage() {
    const userContext = await requireAuth();

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">DataSaaS</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm">{userContext.name}</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 md:p-8">
                <div className="mx-auto max-w-7xl space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground mt-1">
                            Welcome back, {userContext.name}!
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Getting Started</CardTitle>
                            <CardDescription>
                                Your company dashboard is being set up
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Welcome to DataSaaS! Your company features will be available here soon.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default DashboardPage;