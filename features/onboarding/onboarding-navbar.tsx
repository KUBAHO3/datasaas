"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, LogOut, User, HelpCircle, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOutAction } from "@/lib/services/actions/auth.actions";
import { toast } from "sonner";

interface OnboardingNavbarProps {
    userName?: string;
    userEmail?: string;
}

export function OnboardingNavbar({ userName, userEmail }: OnboardingNavbarProps) {
    const router = useRouter();

    async function handleSignOut() {
        try {
            await signOutAction();
            toast.success("Signed out successfully");
            router.push("/sign-in");
        } catch (error) {
            toast.error("Failed to sign out");
        }
    }

    const initials = userName
        ? userName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "U";

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <Building2 className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">DataSaaS</span>
                </Link>

                <div className="flex items-center gap-4">
                    {/* Help Button */}
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/help">
                            <HelpCircle className="h-4 w-4 mr-2" />
                            Help
                        </Link>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{userName || "User"}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {userEmail || ""}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/" className="cursor-pointer">
                                    <Home className="mr-2 h-4 w-4" />
                                    <span>Home</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/profile" className="cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="cursor-pointer text-destructive focus:text-destructive"
                                onClick={handleSignOut}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
}