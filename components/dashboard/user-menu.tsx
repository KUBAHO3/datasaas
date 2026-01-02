
"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOutAction } from "@/lib/services/actions/auth.actions"
import { UserCircle, Settings, LogOut, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function UserMenu({
    user,
}: {
    user: { name: string; email: string; role: string }
}) {
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

    return (
        <div className="border-t p-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start gap-2 overflow-hidden">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
                            <UserCircle className="h-5 w-5" />
                        </div>

                        <div className="flex flex-1 flex-col items-start text-left text-sm min-w-0">
                            <span className="font-medium truncate w-full" title={user.name}>
                                {user.name}
                            </span>
                            <span className="text-xs text-muted-foreground truncate w-full">
                                {user.role}
                            </span>
                        </div>

                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium truncate" title={user.name}>
                                {user.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate" title={user.email}>
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                        <Link href="/dashboard/profile">
                            <UserCircle className="mr-2 h-4 w-4" />
                            Profile
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                        <Link href="/settings">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-destructive cursor-pointer"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
