"use server";

import { createRoleAction, action } from "@/lib/safe-action";
import {
  inviteTeamMemberSchema,
  updateMemberRoleSchema,
  removeMemberSchema,
  resendInvitationSchema,
  listTeamMembersSchema,
  suspendMemberSchema,
  unsuspendMemberSchema,
  acceptInvitationSchema,
} from "@/lib/schemas/user-schema";
import { AdminTeamsService } from "../core/base-teams";
import { AdminUsersService, UserDataAdminModel } from "../models/users.model";
import { AdminAccountService } from "../core/base-account";
import { APP_URL } from "@/lib/env-config";
import { revalidatePath } from "next/cache";
import { ID } from "node-appwrite";
import { TeamMemberRole } from "@/lib/types/user-types";
import { getRoleArray, RBAC_ROLES } from "@/lib/constants/rbac-roles";

async function enrichMemberships(memberships: any[], companyId: string) {
  const usersService = new AdminUsersService();
  const userDataModel = new UserDataAdminModel();

  const enriched = await Promise.all(
    memberships.map(async (membership) => {
      try {
        const user = membership.userId
          ? await usersService.get(membership.userId)
          : null;

        const userData = membership.userId
          ? await userDataModel.findByUserId(membership.userId)
          : null;

        let role: TeamMemberRole = RBAC_ROLES.VIEWER as TeamMemberRole;
        if (membership.roles.includes(RBAC_ROLES.OWNER)) role = RBAC_ROLES.OWNER as TeamMemberRole;
        else if (membership.roles.includes(RBAC_ROLES.ADMIN)) role = RBAC_ROLES.ADMIN as TeamMemberRole;
        else if (membership.roles.includes(RBAC_ROLES.EDITOR)) role = RBAC_ROLES.EDITOR as TeamMemberRole;

        return {
          membershipId: membership.$id,
          userId: membership.userId || null,
          email: user?.email || membership.userEmail,
          name: user?.name || membership.userName || "Pending",
          avatar: userData?.avatar,
          bio: userData?.bio,
          jobTitle: userData?.jobTitle,
          role,
          confirmed: membership.confirm,
          invited: membership.invited,
          joined: membership.joined,
          suspended: userData?.suspended || false,
          suspendedAt: userData?.suspendedAt,
          $createdAt: membership.$createdAt,
          $updatedAt: membership.$updatedAt,
        };
      } catch (error) {
        console.error("Error enriching membership:", error);
        return null;
      }
    })
  );

  return enriched.filter((member): member is NonNullable<typeof member> => member !== null);
}

export const listTeamMembers = createRoleAction(getRoleArray("ALL_ROLES"))
  .inputSchema(listTeamMembersSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { companyId } = parsedInput;

    if (!ctx.isSuperAdmin && "companyId" in ctx && ctx.companyId !== companyId) {
      throw new Error("You do not have permission to view this company's members");
    }

    const teamsService = new AdminTeamsService();
    const { InvitationAdminModel } = await import("../models/invitation.model");

    const memberships = await teamsService.listMemberships(companyId);
    const activeMembers = await enrichMemberships(memberships.memberships, companyId);

    const invitationModel = new InvitationAdminModel();
    const pendingInvitations = await invitationModel.listByCompany(companyId, "pending");

    const pendingMembers = pendingInvitations.map((invitation) => ({
      membershipId: invitation.$id,
      userId: null,
      email: invitation.email,
      name: invitation.name || "Pending",
      avatar: undefined,
      bio: undefined,
      jobTitle: undefined,
      role: invitation.role,
      confirmed: false,
      invited: invitation.$createdAt,
      joined: undefined,
      suspended: false,
      suspendedAt: undefined,
      $createdAt: invitation.$createdAt,
      $updatedAt: invitation.$updatedAt,
    }));

    const allMembers = [...activeMembers, ...pendingMembers];

    return {
      success: true,
      data: {
        activeMembers,
        pendingMembers,
        total: allMembers.length,
        stats: {
          owners: allMembers.filter((m) => m.role === "owner").length,
          admins: allMembers.filter((m) => m.role === "admin").length,
          editors: allMembers.filter((m) => m.role === "editor").length,
          viewers: allMembers.filter((m) => m.role === "viewer").length,
        },
      },
    };
  });

export const inviteTeamMember = createRoleAction(getRoleArray("OWNER_AND_ADMIN"))
  .inputSchema(inviteTeamMemberSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { email, role, name, companyId } = parsedInput;

    if (!ctx.isSuperAdmin && "companyId" in ctx && ctx.companyId !== companyId) {
      throw new Error("You do not have permission to invite members to this company");
    }

    const teamsService = new AdminTeamsService();
    const { InvitationAdminModel } = await import("../models/invitation.model");
    const { sendTeamInvitationEmail } = await import("../email/resend");
    const { CompanyAdminModel } = await import("../models/company.model");

    const existingMemberships = await teamsService.listMemberships(companyId);
    const isAlreadyMember = existingMemberships.memberships.some(
      (m) => m.userEmail === email && m.confirm
    );

    if (isAlreadyMember) {
      throw new Error("This user is already a member of this company");
    }

    const invitationModel = new InvitationAdminModel();
    const existingInvitation = await invitationModel.findByEmailAndCompany(email, companyId);

    if (existingInvitation) {
      throw new Error("This user already has a pending invitation");
    }

    const companyModel = new CompanyAdminModel();
    const company = await companyModel.findById(companyId);

    if (!company) {
      throw new Error("Company not found");
    }

    const token = InvitationAdminModel.generateToken();
    const expiresAt = InvitationAdminModel.getExpirationDate(7);

    const invitation = await invitationModel.create({
      email,
      name,
      role,
      companyId,
      companyName: company.companyName,
      invitedBy: ctx.userId,
      inviterName: ctx.name || "Team Admin",
      token,
      expiresAt,
      status: "pending",
    });

    const inviteUrl = `${APP_URL}/invite/accept?token=${token}`;

    await sendTeamInvitationEmail(
      email,
      ctx.name || "Team Admin",
      company.companyName,
      role,
      inviteUrl,
      name
    );

    revalidatePath(`/org/${companyId}/users`);
    revalidatePath(`/org/${companyId}`);

    return {
      success: true,
      message: `Invitation sent to ${email}`,
      data: {
        invitationId: invitation.$id,
        email,
        role,
      },
    };
  });

export const updateMemberRole = createRoleAction(getRoleArray("OWNER_AND_ADMIN"))
  .inputSchema(updateMemberRoleSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { membershipId, companyId, role } = parsedInput;

    if (!ctx.isSuperAdmin && "companyId" in ctx && ctx.companyId !== companyId) {
      throw new Error("You do not have permission to update members in this company");
    }

    const teamsService = new AdminTeamsService();
    const membership = await teamsService.getMembership(companyId, membershipId);

    if (membership.roles.includes(RBAC_ROLES.OWNER) && role !== RBAC_ROLES.OWNER) {
      const allMemberships = await teamsService.listMemberships(companyId);
      const ownerCount = allMemberships.memberships.filter((m) =>
        m.roles.includes(RBAC_ROLES.OWNER)
      ).length;

      if (ownerCount <= 1) {
        throw new Error("Cannot change role. There must be at least one owner in the team.");
      }
    }

    await teamsService.updateMembershipRoles(companyId, membershipId, [role]);

    if (membership.userId) {
      const userDataModel = new UserDataAdminModel();
      const userData = await userDataModel.findByUserId(membership.userId);

      if (userData) {
        await userDataModel.updateById(userData.$id, { role });
      }
    }

    revalidatePath(`/org/${companyId}/users`);
    revalidatePath(`/org/${companyId}`);

    return {
      success: true,
      message: `Role updated to ${role}`,
      data: { membershipId, role },
    };
  });

export const removeMember = createRoleAction(getRoleArray("OWNER_AND_ADMIN"))
  .inputSchema(removeMemberSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { membershipId, companyId, userId } = parsedInput;

    if (!ctx.isSuperAdmin && "companyId" in ctx && ctx.companyId !== companyId) {
      throw new Error("You do not have permission to remove members from this company");
    }

    if (userId === ctx.userId) {
      throw new Error("You cannot remove yourself from the team");
    }

    // Check if this is a pending invitation (userId is "pending" or null)
    const isPendingInvitation = !userId || userId === "pending";

    if (isPendingInvitation) {
      // For pending invitations, delete the invitation record
      const { InvitationAdminModel } = await import("../models/invitation.model");
      const invitationModel = new InvitationAdminModel();

      await invitationModel.delete(membershipId);

      revalidatePath(`/org/${companyId}/users`);
      revalidatePath(`/org/${companyId}`);

      return {
        success: true,
        message: "Invitation cancelled successfully",
        data: { membershipId },
      };
    }

    // For active members, delete the membership
    const teamsService = new AdminTeamsService();
    const membership = await teamsService.getMembership(companyId, membershipId);

    if (membership.roles.includes(RBAC_ROLES.OWNER)) {
      const allMemberships = await teamsService.listMemberships(companyId);
      const ownerCount = allMemberships.memberships.filter((m) =>
        m.roles.includes(RBAC_ROLES.OWNER)
      ).length;

      if (ownerCount <= 1) {
        throw new Error("Cannot remove the last owner. Please assign another owner first.");
      }
    }

    await teamsService.deleteMembership(companyId, membershipId);

    revalidatePath(`/org/${companyId}/users`);
    revalidatePath(`/org/${companyId}`);

    return {
      success: true,
      message: "Member removed successfully",
      data: { membershipId },
    };
  });

export const resendInvitation = createRoleAction(getRoleArray("OWNER_AND_ADMIN"))
  .inputSchema(resendInvitationSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { invitationId, companyId } = parsedInput;

    if (!ctx.isSuperAdmin && "companyId" in ctx && ctx.companyId !== companyId) {
      throw new Error("You do not have permission to manage invitations for this company");
    }

    const { InvitationAdminModel } = await import("../models/invitation.model");
    const { sendTeamInvitationEmail } = await import("../email/resend");

    const invitationModel = new InvitationAdminModel();
    const oldInvitation = await invitationModel.findById(invitationId);

    if (!oldInvitation) {
      throw new Error("Invitation not found");
    }

    if (oldInvitation.status === "accepted") {
      throw new Error("This invitation has already been accepted");
    }

    if (oldInvitation.companyId !== companyId) {
      throw new Error("Invitation does not belong to this company");
    }

    await invitationModel.delete(invitationId);

    const token = InvitationAdminModel.generateToken();
    const expiresAt = InvitationAdminModel.getExpirationDate(7);

    const newInvitation = await invitationModel.create({
      email: oldInvitation.email,
      name: oldInvitation.name,
      role: oldInvitation.role,
      companyId: oldInvitation.companyId,
      companyName: oldInvitation.companyName,
      invitedBy: ctx.userId,
      inviterName: ctx.name || "Team Admin",
      token,
      expiresAt,
      status: "pending",
    });

    const inviteUrl = `${APP_URL}/invite/accept?token=${token}`;

    await sendTeamInvitationEmail(
      oldInvitation.email,
      ctx.name || "Team Admin",
      oldInvitation.companyName,
      oldInvitation.role,
      inviteUrl,
      oldInvitation.name
    );

    revalidatePath(`/org/${companyId}/users`);

    return {
      success: true,
      message: `Invitation resent to ${oldInvitation.email}`,
      data: { invitationId: newInvitation.$id },
    };
  });

export const suspendMember = createRoleAction(getRoleArray("OWNER_AND_ADMIN"))
  .inputSchema(suspendMemberSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { membershipId, companyId, userId, reason } = parsedInput;

    if (!ctx.isSuperAdmin && "companyId" in ctx && ctx.companyId !== companyId) {
      throw new Error("You do not have permission to suspend members in this company");
    }

    if (userId === ctx.userId) {
      throw new Error("You cannot suspend yourself");
    }

    const teamsService = new AdminTeamsService();
    const membership = await teamsService.getMembership(companyId, membershipId);

    if (membership.roles.includes(RBAC_ROLES.OWNER)) {
      const allMemberships = await teamsService.listMemberships(companyId);
      const activeOwnerCount = allMemberships.memberships.filter((m) =>
        m.roles.includes(RBAC_ROLES.OWNER)
      ).length;

      if (activeOwnerCount <= 1) {
        throw new Error("Cannot suspend the last owner. Please assign another owner first.");
      }
    }

    const userDataModel = new UserDataAdminModel();
    const userData = await userDataModel.findByUserId(userId);

    if (!userData) {
      throw new Error("User data not found");
    }

    if (userData.companyId !== companyId) {
      throw new Error("User does not belong to this company");
    }

    await userDataModel.updateById(userData.$id, {
      suspended: true,
      suspendedAt: new Date().toISOString(),
      suspendedBy: ctx.userId,
      suspendedReason: reason,
    });

    revalidatePath(`/org/${companyId}/users`);
    revalidatePath(`/org/${companyId}`);

    return {
      success: true,
      message: "Member suspended successfully",
    };
  });

export const unsuspendMember = createRoleAction(getRoleArray("OWNER_AND_ADMIN"))
  .inputSchema(unsuspendMemberSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { companyId, userId } = parsedInput;

    if (!ctx.isSuperAdmin && "companyId" in ctx && ctx.companyId !== companyId) {
      throw new Error("You do not have permission to unsuspend members in this company");
    }

    const userDataModel = new UserDataAdminModel();
    const userData = await userDataModel.findByUserId(userId);

    if (!userData) {
      throw new Error("User data not found");
    }

    await userDataModel.updateById(userData.$id, {
      suspended: false,
      suspendedAt: undefined,
      suspendedBy: undefined,
      suspendedReason: undefined,
    });

    revalidatePath(`/org/${companyId}/users`);
    revalidatePath(`/org/${companyId}`);

    return {
      success: true,
      message: "Member unsuspended successfully",
    };
  });

export const acceptInvitation = action
  .inputSchema(acceptInvitationSchema)
  .action(async ({ parsedInput }) => {
    const { token, name, password } = parsedInput;

    const { InvitationAdminModel } = await import("../models/invitation.model");
    const adminAccountService = new AdminAccountService();
    const adminUsersService = new AdminUsersService();
    const adminTeamsService = new AdminTeamsService();
    const userDataModel = new UserDataAdminModel();

    const invitationModel = new InvitationAdminModel();
    const invitation = await invitationModel.findByToken(token);

    if (!invitation) {
      throw new Error("Invalid invitation token");
    }

    if (invitationModel.isExpired(invitation)) {
      await invitationModel.updateStatus(invitation.$id, "expired");
      throw new Error("This invitation has expired");
    }

    if (invitation.status !== "pending") {
      throw new Error("This invitation has already been used");
    }

    const userId = ID.unique();

    try {
      await adminUsersService.createUser(userId, invitation.email, password, name);
    } catch (error: any) {
      // Handle Appwrite-specific errors
      if (error?.type === 'user_already_exists' || error?.code === 409) {
        throw new Error(
          "A user with this email already exists. If you already have an account, please sign in instead of accepting this invitation."
        );
      }
      // Re-throw other errors to be handled by the global error handler
      throw error;
    }

    await adminAccountService.createSession(invitation.email, password);

    await adminTeamsService.createMembership(
      invitation.companyId,
      [invitation.role],
      invitation.email,
      undefined,
      userId,
      undefined,
      name
    );

    await userDataModel.createUserData(userId, {
      name,
      email: invitation.email,
      companyId: invitation.companyId,
      role: invitation.role,
    });

    await invitationModel.updateStatus(invitation.$id, "accepted");

    revalidatePath(`/org/${invitation.companyId}/users`);
    revalidatePath(`/org/${invitation.companyId}`);

    return {
      success: true,
      message: "Invitation accepted successfully! Welcome to the team.",
      data: {
        userId,
        teamId: invitation.companyId,
        email: invitation.email,
        role: invitation.role,
      },
    };
  });
