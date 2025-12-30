"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Eye, EyeOff, Lock, Mail, User, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptInvitation } from "@/lib/services/actions/team-members.actions";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { acceptInvitationSchema } from "@/lib/schemas/user-schema";

type AcceptInvitationFormValues = z.infer<typeof acceptInvitationSchema>;

interface AcceptInvitationCardProps {
  token: string;
}

export function AcceptInvitationCard({ token }: AcceptInvitationCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const form = useForm<AcceptInvitationFormValues>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      token,
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { execute: accept, isExecuting } = useAction(acceptInvitation, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data?.teamId) {
        toast.success("Welcome aboard!", {
          description: data.message,
        });

        // Redirect to the organization dashboard
        router.push(`/org/${data.data.teamId}`);
      } else {
        toast.error("Failed to accept invitation", {
          description: "Please try again or contact support",
        });
      }
    },
    onError: ({ error }) => {
      toast.error("Failed to accept invitation", {
        description: error.serverError || "An error occurred while accepting the invitation",
      });
    },
  });

  function onSubmit(data: AcceptInvitationFormValues) {
    accept(data);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full sm:max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" />
            Accept Invitation
          </CardTitle>
          <CardDescription>
            Complete your registration to join the team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="accept-invitation-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Full Name *</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type="text"
                        placeholder="John Doe"
                        id="name"
                        aria-invalid={fieldState.invalid}
                        autoComplete="name"
                      />
                      <InputGroupAddon>
                        <User />
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">Password *</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        id="password"
                        aria-invalid={fieldState.invalid}
                        autoComplete="new-password"
                      />
                      <InputGroupAddon>
                        <Lock />
                      </InputGroupAddon>
                      <InputGroupAddon
                        className="cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    {!fieldState.invalid && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Must be at least 8 characters with uppercase, lowercase, and number
                      </p>
                    )}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="confirmPassword">Confirm Password *</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        id="confirmPassword"
                        aria-invalid={fieldState.invalid}
                        autoComplete="new-password"
                      />
                      <InputGroupAddon>
                        <Lock />
                      </InputGroupAddon>
                      <InputGroupAddon
                        className="cursor-pointer"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Button type="submit" className="w-full" disabled={isExecuting}>
                {isExecuting ? "Accepting..." : "Accept Invitation & Join Team"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
