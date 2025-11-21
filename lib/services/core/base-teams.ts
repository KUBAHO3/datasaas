import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "./appwrite";

export interface CreateTeamOptions {
  name: string;
  roles?: string[];
}

export interface CreateMembershipOptions {
  email: string;
  roles: string[];
  url: string;
  name?: string;
}

export class SessionTeamsService {
  protected async getClient() {
    return await createSessionClient();
  }

  async list(queries?: string[]) {
    const client = await this.getClient();
    return await client.teams.list(queries);
  }

  async create(options: CreateTeamOptions) {
    const client = await this.getClient();
    return await client.teams.create(ID.unique(), options.name, options.roles);
  }

  async get(teamId: string) {
    const client = await this.getClient();
    return await client.teams.get(teamId);
  }

  async updateName(teamId: string, name: string) {
    const client = await this.getClient();
    return await client.teams.updateName(teamId, name);
  }

  async delete(teamId: string) {
    const client = await this.getClient();
    return await client.teams.delete(teamId);
  }

  async listMemberships(teamId: string, queries?: string[]) {
    const client = await this.getClient();
    return await client.teams.listMemberships(teamId, queries);
  }

  async createMembership(teamId: string, options: CreateMembershipOptions) {
    const client = await this.getClient();
    return await client.teams.createMembership(
      teamId,
      options.roles,
      options.email,
      options.url,
      options.name
    );
  }

  async getMembership(teamId: string, membershipId: string) {
    const client = await this.getClient();
    return await client.teams.getMembership(teamId, membershipId);
  }

  async updateMembershipRoles(
    teamId: string,
    membershipId: string,
    roles: string[]
  ) {
    const client = await this.getClient();
    return await client.teams.updateMembership(teamId, membershipId, roles);
  }

  async deleteMembership(teamId: string, membershipId: string) {
    const client = await this.getClient();
    return await client.teams.deleteMembership(teamId, membershipId);
  }

  async updateMembershipStatus(
    teamId: string,
    membershipId: string,
    userId: string,
    secret: string
  ) {
    const client = await this.getClient();
    return await client.teams.updateMembershipStatus(
      teamId,
      membershipId,
      userId,
      secret
    );
  }
}

export class AdminTeamsService {
  protected async getClient() {
    return await createAdminClient();
  }

  async list(queries?: string[]) {
    const client = await this.getClient();
    return await client.teams.list(queries);
  }

  async create(options: CreateTeamOptions) {
    const client = await this.getClient();
    return await client.teams.create(ID.unique(), options.name, options.roles);
  }

  async get(teamId: string) {
    const client = await this.getClient();
    return await client.teams.get(teamId);
  }

  async updateName(teamId: string, name: string) {
    const client = await this.getClient();
    return await client.teams.updateName(teamId, name);
  }

  async delete(teamId: string) {
    const client = await this.getClient();
    return await client.teams.delete(teamId);
  }
}
