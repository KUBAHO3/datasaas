import { ID } from "node-appwrite";
import { createAdminClient } from "./appwrite";

export interface CreateUserOptions {
  email: string;
  password?: string;
  name?: string;
  phone?: string;
}

export interface UpdateUserOptions {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  emailVerification?: boolean;
  phoneVerification?: boolean;
  labels?: string[];
  prefs?: Record<string, any>;
}

export class UsersService {
  protected async getClient() {
    return await createAdminClient();
  }

  async list(queries?: string[]) {
    const client = await this.getClient();
    return await client.users.list(queries);
  }

  async create(options: CreateUserOptions) {
    const client = await this.getClient();
    return await client.users.create(
      ID.unique(),
      options.email,
      options.phone,
      options.password,
      options.name
    );
  }

  async get(userId: string) {
    const client = await this.getClient();
    return await client.users.get(userId);
  }

  async delete(userId: string) {
    const client = await this.getClient();
    return await client.users.delete(userId);
  }

  async updateName(userId: string, name: string) {
    const client = await this.getClient();
    return await client.users.updateName(userId, name);
  }

  async updateEmail(userId: string, email: string) {
    const client = await this.getClient();
    return await client.users.updateEmail(userId, email);
  }

  async updatePassword(userId: string, password: string) {
    const client = await this.getClient();
    return await client.users.updatePassword(userId, password);
  }

  async updatePhone(userId: string, phone: string) {
    const client = await this.getClient();
    return await client.users.updatePhone(userId, phone);
  }

  async updateEmailVerification(userId: string, emailVerification: boolean) {
    const client = await this.getClient();
    return await client.users.updateEmailVerification(
      userId,
      emailVerification
    );
  }

  async updatePhoneVerification(userId: string, phoneVerification: boolean) {
    const client = await this.getClient();
    return await client.users.updatePhoneVerification(
      userId,
      phoneVerification
    );
  }

  async updateLabels(userId: string, labels: string[]) {
    const client = await this.getClient();
    return await client.users.updateLabels(userId, labels);
  }

  async updatePrefs(userId: string, prefs: Record<string, any>) {
    const client = await this.getClient();
    return await client.users.updatePrefs(userId, prefs);
  }

  async getPrefs(userId: string) {
    const client = await this.getClient();
    return await client.users.getPrefs(userId);
  }

  async getSessions(userId: string) {
    const client = await this.getClient();
    return await client.users.listSessions(userId);
  }

  async deleteSessions(userId: string) {
    const client = await this.getClient();
    return await client.users.deleteSessions(userId);
  }

  async deleteSession(userId: string, sessionId: string) {
    const client = await this.getClient();
    return await client.users.deleteSession(userId, sessionId);
  }
}
