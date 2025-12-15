"use server";

import { cache } from "react";
import { AdminTeamsService } from "../core/base-teams";

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
        return "viewer";
      }

      if (userMembership.roles.includes("owner")) return "owner";
      if (userMembership.roles.includes("admin")) return "admin";
      if (userMembership.roles.includes("editor")) return "editor";
      return "viewer";
    } catch (error) {
      console.error("Get user team role error:", error);
      return "viewer";
    }
  }
);
