import { OnboardingLayout } from "@/features/onboarding/onboarding-layout";
import { OnboardingStepper } from "@/features/onboarding/onboarding-stepper";
import { getOnboardingProgress } from "@/lib/services/actions/onboarding.actions";
import { SessionAccountService } from "@/lib/services/core/base-account";
import { redirect } from "next/navigation";

export default async function OnboardingRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const progress = await getOnboardingProgress();

    let user = null;
    try {
        const sessionAccountService = new SessionAccountService();
        user = await sessionAccountService.get();
    } catch (error) {
        redirect("/sign-in");
    }
    
    return (
        <OnboardingLayout userName={user?.name} userEmail={user?.email}>
            <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold mb-2">Company Onboarding</h1>
                        <p className="text-muted-foreground">
                            Complete the steps below to register your company
                        </p>
                    </div>
                    <OnboardingStepper
                        currentStep={progress.currentStep ?? 1}
                        completedSteps={progress.completedSteps ?? []}
                    />

                    {children}
                </div>
            </div>
        </OnboardingLayout>
    );
}