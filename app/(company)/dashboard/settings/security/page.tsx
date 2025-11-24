import { requireAuth } from "@/lib/access-control/permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Clock } from "lucide-react";
import { AdminUsersService } from "@/lib/services/models/users.model";
import { ChangePasswordForm } from "@/features/auth/change-password-form";

async function getActiveSessions(userId: string) {
    try {
        const adminUsersService = new AdminUsersService();
        const sessions = await adminUsersService.listSessions(userId);
        return sessions.sessions;
    } catch (error) {
        console.error("Failed to get sessions:", error);
        return [];
    }
}

export default async function SecuritySettingsPage() {
    const userContext = await requireAuth();
    const sessions = await getActiveSessions(userContext.userId);

    return (
        <div className="flex-1 p-6 md:p-8">
            <div className="mx-auto max-w-4xl space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your account security and password
                    </p>
                </div>

                <ChangePasswordForm />

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <CardTitle>Active Sessions</CardTitle>
                        </div>
                        <CardDescription>
                            Devices where you're currently signed in
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {sessions.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No active sessions found
                                </p>
                            ) : (
                                sessions.map((session) => (
                                    <div
                                        key={session.$id}
                                        className="flex items-start justify-between rounded-lg border p-4"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium">
                                                    {session.osName || "Unknown"} - {session.clientName || "Unknown"}
                                                </p>
                                                {session.current && (
                                                    <span className="rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs text-green-700 dark:text-green-300">
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {session.ip || "Unknown IP"} • {session.countryName || "Unknown location"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Last active: {new Date(session.$createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}