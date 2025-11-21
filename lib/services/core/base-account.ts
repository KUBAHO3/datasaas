import { cookies } from "next/headers";
import { createAdminClient, createSessionClient } from "./appwrite";
import { AUTH_COOKIE } from "@/lib/constants";

export class SessionAccountService {
  protected async getClient() {
    return await createSessionClient();
  }

  async get() {
    const client = await this.getClient();
    return await client.account.get();
  }

  async updateName(name: string) {
    const client = await this.getClient();
    return await client.account.updateName(name);
  }

  async updateEmail(email: string, password: string) {
    const client = await this.getClient();
    return await client.account.updateEmail(email, password);
  }

  async updatePassword(password: string, oldPassword: string) {
    const client = await this.getClient();
    return await client.account.updatePassword(password, oldPassword);
  }

  async updatePhone(phone: string, password: string) {
    const client = await this.getClient();
    return await client.account.updatePhone(phone, password);
  }

  async updatePrefs(prefs: Record<string, any>) {
    const client = await this.getClient();
    return await client.account.updatePrefs(prefs);
  }

  async getPrefs() {
    const client = await this.getClient();
    return await client.account.getPrefs();
  }

  async getSessions() {
    const client = await this.getClient();
    return await client.account.listSessions();
  }

  async deleteSession(sessionId: string) {
    const client = await this.getClient();
    await client.account.deleteSession(sessionId);

    const cookieStore = await cookies();

    cookieStore.delete(AUTH_COOKIE);
  }

  async deleteSessions() {
    const client = await this.getClient();
    return await client.account.deleteSessions();
  }

  async createRecovery(email: string, url: string) {
    const client = await this.getClient();
    return await client.account.createRecovery(email, url);
  }

  async updateRecovery(userId: string, secret: string, password: string) {
    const client = await this.getClient();
    return await client.account.updateRecovery(userId, secret, password);
  }

  async createVerification(url: string) {
    const client = await this.getClient();
    return await client.account.createVerification(url);
  }

  async updateVerification(userId: string, secret: string) {
    const client = await this.getClient();
    return await client.account.updateVerification(userId, secret);
  }
}

export class AdminAccountService {
  protected async getClient() {
    return await createAdminClient();
  }

  async createSession(email: string, password: string) {
    const client = await this.getClient();
    const session = await client.account.createEmailPasswordSession(
      email,
      password
    );

    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE, session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return { success: "You are logged in.", session };
  }
}
