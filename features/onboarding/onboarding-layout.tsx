import { OnboardingNavbar } from "./onboarding-navbar";
import { OnboardingFooter } from "./onboarding-footer";
import { ReactNode } from "react";

interface OnboardingLayoutProps {
    children: ReactNode;
    userName?: string;
    userEmail?: string;
}

export function OnboardingLayout({
    children,
    userName,
    userEmail,
}: OnboardingLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <OnboardingNavbar userName={userName} userEmail={userEmail} />
            <div className="flex-1">{children}</div>
            <OnboardingFooter />
        </div>
    );
}