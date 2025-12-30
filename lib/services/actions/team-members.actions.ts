"use server";

import { createRoleAction } from "@/lib/safe-action";
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
import { ID, Query } from "node-appwrite";
import { TeamMemberRole } from "@/lib/types/user-types";
import { Invitation } from "@/lib/types/invitation-types";
import { action } from "@/lib/safe-action";

// Helper function to get team member details with user data
async function enrichMemberships(memberships: any[], companyId: string) {
  const usersService = new AdminUsersService();
  const userDataModel = new UserDataAdminModel();

  const enriched = await Promise.all(
    memberships.map(async (membership) => {
      try {
        // Get user account info
        const user = membership.userId
          ? await usersService.get(membership.userId)
          : null;

        // Get user data (role, avatar, bio, etc.)
        const userData = membership.userId
          ? await userDataModel.findByUserId(membership.userId)
          : null;

        // Determine role from membership
        let role: TeamMemberRole = "viewer";
        if (membership.roles.includes("owner")) role = "owner";
        else if (membership.roles.includes("admin")) role = "admin";
        else if (membership.roles.includes("editor")) role = "editor";

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

/**
 * List all team members (active) and pending invitations
 */
export const listTeamMembers = createRoleAction(["owner", "admin", "editor", "viewer"]).inputSchema(
  listTeamMembersSchema
).action(async ({ parsedInput, ctx }) => {
  try {
    const { companyId } = parsedInput;

    // Verify user has access to this company
    if (!ctx.isSuperAdmin && "companyId" in ctx && ctx.companyId !== companyId) {
      throw new Error("You do not have permission to view this company's members");
    }

    const teamsService = new AdminTeamsService();
    const { InvitationModel } = await import("../models/invitation.model");

    // Get confirmed team members from Appwrite
    const memberships = await teamsService.listMemberships(companyId);
    const activeMembers = await enrichMemberships(
      memberships.memberships,
      companyId
    );

    // Get pending invitations from Invitations collection
    const invitationModel = new InvitationModel();
    const pendingInvitations = await invitationModel.listByCompany(companyId, "pending");

    // Format pending invitations to match TeamMember interface
    const pendingMembers = pendingInvitations.map((invitation) => ({
      membershipId: invitation.$id, // Use invitation ID as membershipId for UI compatibility
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
  } catch (error) {
    console.error("List team members error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to list team members"
    );
  }
});

/**
 * Invite a new team member (using Resend)
 */
export const inviteTeamMember = createRoleAction(["owner", "admin"]).schema(
  inviteTeamMemberSchema
).action(async ({ parsedInput, ctx }) => {
  try {
    const { email, role, name, companyId } = parsedInput;

    // Verify user has access to this company
    if (!ctx.isSuperAdmin && "companyId" in ctx && ctx.companyId !== companyId) {
      throw new Error("You do not have permission to invite members to this company");
    }

    const teamsService = new AdminTeamsService();
    const { InvitationModel } = await import("../models/invitation.model");
    const { sendTeamInvitationEmail } = await import("../email/resend");
    const { CompanyAdminModel } = await import("../models/company.model");

    // Check if user is already a team member
    const existingMemberships = await teamsService.listMemberships(companyId);
    const isAlreadyMember = existingMemberships.memberships.some(
      (m) => m.userEmail === email && m.confirm
    );

    if (isAlreadyMember) {
      throw new Error("This user is already a member of this company");
    }

    // Check if there's already a pending invitation
    const invitationModel = new InvitationModel();
    const existingInvitation = await invitationModel.findByEmailAndCompany(
      email,
      companyId
    );

    if (existingInvitation) {
      throw new Error("This user already has a pending invitation");
    }

    // Get company details
    const companyModel = new CompanyAdminModel();
    const company = await companyModel.findById(companyId);

    if (!company) {
      throw new Error("Company not found");
    }

    // Generate invitation token
    const token = InvitationModel.generateToken();
    const expiresAt = InvitationModel.getExpirationDate(7); // 7 days

    // Create invitation record
    const invitation = await invitationModel.create({
      email,
      name,
      role,
      companyId,
      companyName: company.name,
      invitedBy: ctx.userId,
      inviterName: ctx.name || "Team Admin",
      token,
      expiresAt,
      status: "pending",
    });

    // Create invitation URL with token
    const inviteUrl = `${APP_URL}/invite/accept?token=${token}`;

    // Send invitation email via Resend
    await sendTeamInvitationEmail(
      email,
      ctx.name || "Team Admin",
      company.name,
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
  } catch (error) {
    console.error("Invite team member error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to invite team member"
    );
  }
});

/**
 * Update a member's role
 */
export const updateMemberRole = createRoleAction(["owner", "admin"]).schema(
  updateMemberRoleSchema
).action(async ({ parsedInput, ctx }) => {
  try {
    const { membershipId, companyId, role } = parsedInput;

    // Verify user has access to this company
    if (!ctx.isSuperAdmin && "companyId" in ctx && ctx.companyId !== companyId) {
      throw new Error("You do not have permission to update members in this company");
    }

    const teamsService = new AdminTeamsService();

    // Get current membership
    const membership = await teamsService.getMembership(companyId, membershipId);

    // Check if this is the last owner
    if (membership.roles.includes("owner") && role !== "owner") {
      const allMemberships = await teamsService.listMemberships(companyId);
      const ownerCount = allMemberships.memberships.filter((m) =>
        m.roles.includes("owner")
      ).length;

      if (ownerCount <= 1) {
        throw new Error(
          "Cannot change role. There must be at least one owner in the team."
        );
      }
    }

    // Update membership roles
    await teamsService.updateMembershipRoles(companyId, membershipId, [role]);

    // Update UserData collection if user is confirmed
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
      data: {
        membershipId,
        role,
      },
    };
  } catch (error) {
    console.error("Update member role error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update member role"
    );
  }
});

/**
 * Remove a team member
 */
export const removeMember = createRoleAction(["owner", "admin"]).schema(
  removeMemberSchema
).action(async ({ parsedInput, ctx }) => {
  try {
    const { membershipId, companyId, userId } = parsedInput;

    // Verify user has access to this company
    if (!ctx.isSuperAdmin && "companyId" in ctx && ctx.companyId !== companyId) {
      throw new Error("You do not have permission to remove members from this company");
    }

    // Prevent self-removal
    if (userId === ctx.userId) {
      throw new Error("You cannot remove yourself from the team");
    }

    const teamsService = new AdminTeamsService();

    // Get current membership
    const membership = await teamsService.getMembership(companyId, membershipId);

    // Check if this is the last owner
    if (membership.roles.includes("owner")) {
      const allMemberships = await teamsService.listMemberships(companyId);
      const ownerCount = allMemberships.memberships.filter((m) =>
        m.roles.includes("owner")
      ).length;

      if (ownerCount <= 1) {
        throw new Error(
          "Cannot remove the last owner. Please assign another owner first."
        );
      }
    }

    // Delete membership
    await teamsService.deleteMembership(companyId, membershipId);

    revalidatePath(`/org/${companyId}/users`);
    revalidatePath(`/org/${companyId}`);

    return {
      success: true,
      message: "Member removed successfully",
      data: {
        membershipId,
      },
    };
  } catch (error) {
    console.error("Remove member error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to remove member"
    );
  }
});

/**
 * Resend invitation to a pending member (using Resend)
 */
export const resendInvitation = createRoleAction(["owner", "admin"]).schema(
  resendInvitationSchema
).action(async ({ parsedInput, ctx }) => {
  try {
    const { invitationId, companyId } = parsedInput;

    // Verify user has access to this company
    if (!ctx.isSuperAdmin && "companyId" in ctx && ctx.companyId !== companyId) {
      throw new Error("You do not have permission to manage invitations for this company");
    }

    const { InvitationModel } = await import("../models/invitation.model");
    const { sendTeamInvitationEmail } = await import("../email/resend");

    const invitationModel = new InvitationModel();

    // Get current invitation
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

    // Delete old invitation
    await invitationModel.delete(invitationId);

    // Create new invitation with fresh token
    const token = InvitationModel.generateToken();
    const expiresAt = InvitationModel.getExpirationDate(7);

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

    // Send new invitation email
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
      data: {
        invitationId: newInvitation.$id,
      },
    };
  } catch (error) {
    console.error("Resend invitation error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to resend invitation"
    );
  }
});

/**
 * Suspend a team member
 */
export const suspendMember = createRoleAction(["owner", "admin"]).inputSchema(
  suspendMemberSchema
).action(async ({ parsedInput, ctx }) => {
  try {
    const { membershipId, companyId, userId, reason } = parsedInput;

    // Verify access
    if (!ctx.isSuperAdmin && "companyId" in ctx && ctx.companyId !== companyId) {
      throw new Error("You do not have permission to suspend members in this company");
    }

    // Prevent self-suspension
    if (userId === ctx.userId) {
      throw new Error("You cannot suspend yourself");
    }

    const teamsService = new AdminTeamsService();

    // Get membership to check if owner
    const membership = await teamsService.getMembership(companyId, membershipId);

    // Check if suspending the last owner
    if (membership.roles.includes("owner")) {
      const allMemberships = await teamsService.listMemberships(companyId);
      const activeOwnerCount = allMemberships.memberships.filter((m) =>
        m.roles.includes("owner")
      ).length;

      if (activeOwnerCount <= 1) {
        throw new Error(
          "Cannot suspend the last owner. Please assign another owner first."
        );
      }
    }

    // Update UserData
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
  } catch (error) {
    console.error("Suspend member error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to suspend member"
    );
  }
});

/**
 * Unsuspend a team member
 */
export const unsuspendMember = createRoleAction(["owner", "admin"]).inputSchema(
  unsuspendMemberSchema
).action(async ({ parsedInput, ctx }) => {
  try {
    const { companyId, userId } = parsedInput;

    // Verify access
    if (!ctx.isSuperAdmin && "companyId" in ctx && ctx.companyId !== companyId) {
      throw new Error("You do not have permission to unsuspend members in this company");
    }

    // Update UserData
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
  } catch (error) {
    console.error("Unsuspend member error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to unsuspend member"
    );
  }
});

/**
 * Accept team invitation (using Resend-based invitations)
 * This action validates the invitation token, creates the user account,
 * adds them to the team, and logs them in
 */
export const acceptInvitation = action
  .inputSchema(acceptInvitationSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { token, name, password } = parsedInput;

      const { InvitationModel } = await import("../models/invitation.model");
      const adminAccountService = new AdminAccountService();
      const adminTeamsService = new AdminTeamsService();
      const userDataModel = new UserDataAdminModel();

      // 1. Find invitation by token
      const invitationModel = new InvitationModel();
      const invitation = await invitationModel.findByToken(token);

      if (!invitation) {
        throw new Error("Invalid invitation token");
      }

      // 2. Check if invitation is expired
      if (invitationModel.isExpired(invitation)) {
        await invitationModel.updateStatus(invitation.$id, "expired");
        throw new Error("This invitation has expired");
      }

      // 3. Check if already accepted
      if (invitation.status !== "pending") {
        throw new Error("This invitation has already been used");
      }

      // 4. Create user account
      const userId = ID.unique();
      await adminAccountService.create(
        userId,
        invitation.email,
        password,
        name
      );

      // 5. Create session for the new user
      await adminAccountService.createSession(invitation.email, password);

      // 6. Add user to the company team (AFTER account creation)
      await adminTeamsService.createMembership(
        invitation.companyId,
        [invitation.role], // Appwrite roles
        invitation.email,
        undefined, // url (not needed, user already accepting)
        userId,     // userId - link to the account we just created
        undefined,  // phone
        name        // name
      );

      // 7. Create UserData record
      await userDataModel.createUserData(userId, {
        name,
        email: invitation.email,
        companyId: invitation.companyId,
        role: invitation.role,
      });

      // 8. Update invitation status
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
    } catch (error) {
      console.error("Accept invitation error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to accept invitation"
      );
    }
  });
