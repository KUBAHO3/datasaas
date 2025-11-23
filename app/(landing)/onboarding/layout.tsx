import { OnboardingStepper } from "@/features/onboarding/onboarding-stepper";
import { getOnboardingProgress } from "@/lib/services/actions/onboarding.actions";

export default async function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const progress = await getOnboardingProgress();

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-2">Company Onboarding</h1>
                    <p className="text-muted-foreground">
                        Complete the steps below to register your company
                    </p>
                </div>

                <OnboardingStepper
                    currentStep={progress.currentStep}
                    completedSteps={progress.completedSteps}
                />

                {children}
            </div>
        </div>
    );
}