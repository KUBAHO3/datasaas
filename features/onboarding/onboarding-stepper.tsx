"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface Step {
    number: number;
    title: string;
    description: string;
}

interface OnboardingStepperProps {
    currentStep: number;
    completedSteps: number[];
}

const steps: Step[] = [
    {
        number: 1,
        title: "Account",
        description: "Create your account",
    },
    {
        number: 2,
        title: "Company Info",
        description: "Basic details",
    },
    {
        number: 3,
        title: "Address",
        description: "Company location",
    },
    {
        number: 4,
        title: "Branding",
        description: "Logo & Tax ID",
    },
    {
        number: 5,
        title: "Documents",
        description: "Upload files",
    },
    {
        number: 6,
        title: "Review",
        description: "Confirm & submit",
    },
];

export function OnboardingStepper({
    currentStep,
    completedSteps,
}: OnboardingStepperProps) {
    return (
        <div className="w-full py-8">
            <div className="relative">
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-border hidden md:block">
                    <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{
                            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                        }}
                    />
                </div>

                <div className="relative grid grid-cols-2 md:grid-cols-6 gap-4">
                    {steps.map((step, index) => {
                        const isCompleted = completedSteps.includes(step.number);
                        const isCurrent = currentStep === step.number;
                        const isPast = step.number < currentStep;

                        return (
                            <div key={step.number} className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background transition-all duration-300",
                                        {
                                            "border-primary bg-primary text-primary-foreground":
                                                isCompleted || isCurrent,
                                            "border-border": !isCompleted && !isCurrent,
                                            "scale-110": isCurrent,
                                        }
                                    )}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-5 w-5" />
                                    ) : (
                                        <span className="text-sm font-semibold">{step.number}</span>
                                    )}
                                </div>
                                <div className="mt-2 text-center">
                                    <p
                                        className={cn("text-sm font-medium", {
                                            "text-primary": isCurrent || isCompleted,
                                            "text-muted-foreground": !isCurrent && !isCompleted,
                                        })}
                                    >
                                        {step.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground hidden md:block">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}