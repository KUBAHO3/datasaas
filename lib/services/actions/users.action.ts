"use server";

import { cache } from "react";
import { AdminTeamsService } from "../core/base-teams";
import { RBAC_ROLES } from "@/lib/constants/rbac-roles";

export const verifyTeamMembership = cache(
  async (userId: string, teamId: string): Promise<boolean> => {
    try {
      const teamsService = new AdminTeamsService();
      const memberships = await teamsService.listMemberships(teamId);

      return memberships.memberships.some(
        (membership) => membership.userId === userId
      );
    } catch (error) {
      console.error("Team membership verification error:", error);
      return false;
    }
  }
);

export const getUserTeamRole = cache(
  async (userId: string, teamId: string): Promise<string> => {
    try {
      const teamsService = new AdminTeamsService();
      const memberships = await teamsService.listMemberships(teamId);

      const userMembership = memberships.memberships.find(
        (membership) => membership.userId === userId
      );

      if (!userMembership) {
        return RBAC_ROLES.VIEWER;
      }

      if (userMembership.roles.includes(RBAC_ROLES.OWNER)) return RBAC_ROLES.OWNER;
      if (userMembership.roles.includes(RBAC_ROLES.ADMIN)) return RBAC_ROLES.ADMIN;
      if (userMembership.roles.includes(RBAC_ROLES.EDITOR)) return RBAC_ROLES.EDITOR;
      return RBAC_ROLES.VIEWER;
    } catch (error) {
      console.error("Get user team role error:", error);
      return RBAC_ROLES.VIEWER;
    }
  }
);
