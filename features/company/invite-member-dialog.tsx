"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { inviteTeamMember } from "@/lib/services/actions/team-members.actions";
import { Loader2, UserPlus } from "lucide-react";
import { RBAC_ROLES, ROLE_DESCRIPTIONS } from "@/lib/constants/rbac-roles";

const inviteFormSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    role: z.enum([
        RBAC_ROLES.OWNER,
        RBAC_ROLES.ADMIN,
        RBAC_ROLES.EDITOR,
        RBAC_ROLES.VIEWER,
    ]),
    name: z.string().min(2, "Name must be at least 2 characters").optional().or(z.literal("")),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

interface InviteMemberDialogProps {
    orgId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function InviteMemberDialog({
    orgId,
    open,
    onOpenChange,
}: InviteMemberDialogProps) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<InviteFormValues>({
        resolver: zodResolver(inviteFormSchema),
        defaultValues: {
            email: "",
            role: RBAC_ROLES.VIEWER,
            name: "",
        },
    });

    const onSubmit = (data: InviteFormValues) => {
        startTransition(async () => {
            try {
                const result = await inviteTeamMember({
                    email: data.email,
                    role: data.role,
                    name: data.name || undefined,
                    companyId: orgId,
                });

                if (result?.data?.success) {
                    toast.success(result.data.message || "Invitation sent successfully");
                    form.reset();
                    onOpenChange(false);
                } else {
                    toast.error("Failed to send invitation");
                }
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "An error occurred while sending the invitation"
                );
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Invite Team Member
                    </DialogTitle>
                    <DialogDescription>
                        Send an email invitation to add a new member to your team. They'll receive an email with a link to join.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="email@example.com"
                                            type="email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The invitation will be sent to this email address
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="John Doe"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Helps personalize the invitation email
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={RBAC_ROLES.VIEWER}>
                                                <div className="flex flex-col items-start">
                                                    <span className="font-medium">
                                                        {ROLE_DESCRIPTIONS[RBAC_ROLES.VIEWER].label}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {ROLE_DESCRIPTIONS[RBAC_ROLES.VIEWER].description}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value={RBAC_ROLES.EDITOR}>
                                                <div className="flex flex-col items-start">
                                                    <span className="font-medium">
                                                        {ROLE_DESCRIPTIONS[RBAC_ROLES.EDITOR].label}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {ROLE_DESCRIPTIONS[RBAC_ROLES.EDITOR].description}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value={RBAC_ROLES.ADMIN}>
                                                <div className="flex flex-col items-start">
                                                    <span className="font-medium">
                                                        {ROLE_DESCRIPTIONS[RBAC_ROLES.ADMIN].label}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {ROLE_DESCRIPTIONS[RBAC_ROLES.ADMIN].description}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value={RBAC_ROLES.OWNER}>
                                                <div className="flex flex-col items-start">
                                                    <span className="font-medium">
                                                        {ROLE_DESCRIPTIONS[RBAC_ROLES.OWNER].label}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {ROLE_DESCRIPTIONS[RBAC_ROLES.OWNER].description}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Invitation
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default InviteMemberDialog;
