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
} from "@/lib/schemas/user-schema";
import { AdminTeamsService } from "../core/base-teams";
import { AdminUsersService, UserDataAdminModel } from "../models/users.model";
import { APP_URL } from "@/lib/env-config";
import { revalidatePath } from "next/cache";
import { Query } from "node-appwrite";
import { TeamMemberRole } from "@/lib/types/user-types";

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
 * List all team members (active and pending)
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
    const memberships = await teamsService.listMemberships(companyId);

    const enrichedMembers = await enrichMemberships(
      memberships.memberships,
      companyId
    );

    // Separate active and pending members
    const activeMembers = enrichedMembers.filter((m) => m.confirmed);
    const pendingMembers = enrichedMembers.filter((m) => !m.confirmed);

    return {
      success: true,
      data: {
        activeMembers,
        pendingMembers,
        total: enrichedMembers.length,
        stats: {
          owners: enrichedMembers.filter((m) => m.role === "owner").length,
          admins: enrichedMembers.filter((m) => m.role === "admin").length,
          editors: enrichedMembers.filter((m) => m.role === "editor").length,
          viewers: enrichedMembers.filter((m) => m.role === "viewer").length,
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
 * Invite a new team member
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

    // Check if user is already a member
    const existingMemberships = await teamsService.listMemberships(companyId);
    const isAlreadyMember = existingMemberships.memberships.some(
      (m) => m.userEmail === email
    );

    if (isAlreadyMember) {
      throw new Error("This user is already a member or has a pending invitation");
    }

    // Create invitation URL
    const inviteUrl = `${APP_URL}/invite/accept`;

    // Create team membership (sends email automatically)
    const membership = await teamsService.createMembership(
      companyId,
      [role], // Appwrite roles
      email,
      inviteUrl,
      undefined, // userId (not known yet)
      undefined, // phone
      name
    );

    revalidatePath(`/org/${companyId}/users`);
    revalidatePath(`/org/${companyId}`);

    return {
      success: true,
      message: `Invitation sent to ${email}`,
      data: {
        membershipId: membership.$id,
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
 * Resend invitation to a pending member
 */
export const resendInvitation = createRoleAction(["owner", "admin"]).schema(
  resendInvitationSchema
).action(async ({ parsedInput, ctx }) => {
  try {
    const { membershipId, companyId, email } = parsedInput;

    // Verify user has access to this company
    if (!ctx.isSuperAdmin && "companyId" in ctx && ctx.companyId !== companyId) {
      throw new Error("You do not have permission to manage invitations for this company");
    }

    const teamsService = new AdminTeamsService();

    // Get current membership to verify it's pending
    const membership = await teamsService.getMembership(companyId, membershipId);

    if (membership.confirm) {
      throw new Error("This user has already accepted the invitation");
    }

    // Get role from membership
    let role: TeamMemberRole = "viewer";
    if (membership.roles.includes("owner")) role = "owner";
    else if (membership.roles.includes("admin")) role = "admin";
    else if (membership.roles.includes("editor")) role = "editor";

    // Delete old membership and create new one (which sends new email)
    await teamsService.deleteMembership(companyId, membershipId);

    const inviteUrl = `${APP_URL}/invite/accept`;

    await teamsService.createMembership(
      companyId,
      [role],
      email,
      inviteUrl,
      undefined,
      undefined,
      membership.userName
    );

    revalidatePath(`/org/${companyId}/users`);

    return {
      success: true,
      message: `Invitation resent to ${email}`,
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
