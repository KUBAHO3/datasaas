import { AppwriteUser, UserData } from "@/lib/types/user-types";
import { AdminDBModel, SessionDBModel } from "../core/base-db-model";
import { DATABASE_ID, USERS_TABLE_ID } from "@/lib/env-config";
import { Query } from "node-appwrite";

export class UserDataSessionModel extends SessionDBModel<UserData> {
  constructor() {
    super(DATABASE_ID, USERS_TABLE_ID);
  }
}

export class UserDataAdminModel extends AdminDBModel<UserData> {
  constructor() {
    super(DATABASE_ID, USERS_TABLE_ID);
  }

  async findByUserId(userId: string): Promise<UserData | null> {
    return this.findOne({
      where: [{ field: "userId", operator: "equals", value: userId }],
    });
  }

  async createUserData(
    userId: string,
    data: Partial<UserData>
  ): Promise<UserData> {
    return this.create(
      {
        userId,
        ...data,
      },
      userId
    );
  }
}

export class AdminUsersService extends AdminDBModel<UserData> {
  constructor() {
    super(DATABASE_ID, USERS_TABLE_ID);
  }

  async get(userId: string): Promise<AppwriteUser> {
    const client = await this.getClient();
    return (await client.users.get(userId)) as AppwriteUser;
  }

  async list(queries?: string[]) {
    const client = await this.getClient();
    return await client.users.list(queries);
  }

  async listPaginated(limit: number = 25, offset: number = 0) {
    const client = await this.getClient();
    const queries = [Query.limit(limit), Query.offset(offset)];
    return await client.users.list(queries);
  }

  async searchByEmail(email: string) {
    const client = await this.getClient();
    const queries = [Query.search("email", email)];
    return await client.users.list(queries);
  }

  async searchByName(name: string) {
    const client = await this.getClient();
    const queries = [Query.search("name", name)];
    return await client.users.list(queries);
  }

  async getByLabel(label: string) {
    const client = await this.getClient();
    const queries = [Query.equal("labels", [label])];
    return await client.users.list(queries);
  }

  async findByUserId(userId: string): Promise<UserData | null> {
    return this.findOne({
      where: [{ field: "userId", operator: "equals", value: userId }],
    });
  }

  async createUser(
    userId: string,
    email: string,
    password: string,
    name?: string
  ) {
    const client = await this.getClient();
    return await client.users.create(userId, email, password, name);
  }

  async createWithEmail(email: string, password: string, name?: string) {
    const client = await this.getClient();
    const { ID } = await import("node-appwrite");
    return await client.users.create(ID.unique(), email, undefined, password, name);
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

  async updateLabels(userId: string, labels: string[]) {
    const client = await this.getClient();
    return await client.users.updateLabels(userId, labels);
  }

  async addLabel(userId: string, label: string) {
    const user = await this.get(userId);
    const currentLabels = user.labels || [];

    if (currentLabels.includes(label)) {
      return user;
    }

    const newLabels = [...currentLabels, label];
    return await this.updateLabels(userId, newLabels);
  }

  async removeLabel(userId: string, label: string) {
    const user = await this.get(userId);
    const currentLabels = user.labels || [];

    const newLabels = currentLabels.filter((l) => l !== label);
    return await this.updateLabels(userId, newLabels);
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

  async updatePrefs(userId: string, prefs: Record<string, any>) {
    const client = await this.getClient();
    return await client.users.updatePrefs(userId, prefs);
  }

  async getPrefs(userId: string) {
    const client = await this.getClient();
    return await client.users.getPrefs(userId);
  }

  async updateStatus(userId: string, status: boolean) {
    const client = await this.getClient();
    return await client.users.updateStatus(userId, status);
  }

  async delete(userId: string) {
    const client = await this.getClient();
    return await client.users.delete(userId);
  }

  async listSessions(userId: string) {
    const client = await this.getClient();
    return await client.users.listSessions(userId);
  }

  async deleteSessions(userId: string) {
    const client = await this.getClient();
    return await client.users.deleteSessions(userId);
  }

  /**
   * Delete specific user session
   */
  async deleteSession(userId: string, sessionId: string) {
    const client = await this.getClient();
    return await client.users.deleteSession(userId, sessionId);
  }

  /**
   * List user's memberships
   */
  async listMemberships(userId: string) {
    const client = await this.getClient();
    return await client.users.listMemberships(userId);
  }

  /**
   * Get user's logs
   */
  async listLogs(userId: string, queries?: string[]) {
    const client = await this.getClient();
    return await client.users.listLogs(userId, queries);
  }

  /**
   * Get total user count
   */
  async count() {
    const client = await this.getClient();
    const result = await client.users.list([Query.limit(1)]);
    return result.total;
  }

  /**
   * Check if user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    try {
      const result = await this.searchByEmail(email);
      return result.users.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user has specific label
   */
  async hasLabel(userId: string, label: string): Promise<boolean> {
    try {
      const user = await this.get(userId);
      return user.labels?.includes(label) || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get super admins
   */
  async getSuperAdmins() {
    return await this.getByLabel("superadmin");
  }

  /**
   * Make user super admin
   */
  async makeSuperAdmin(userId: string) {
    return await this.addLabel(userId, "superadmin");
  }

  /**
   * Remove super admin privilege
   */
  async removeSuperAdmin(userId: string) {
    return await this.removeLabel(userId, "superadmin");
  }

  /**
   * Create user with verification email
   */
  async createAndVerify(email: string, password: string, name?: string) {
    const user = await this.createWithEmail(email, password, name);
    await this.updateEmailVerification(user.$id, true);
    return user;
  }

  /**
   * Bulk disable users
   */
  async bulkDisable(userIds: string[]) {
    const promises = userIds.map((userId) => this.updateStatus(userId, false));
    return await Promise.allSettled(promises);
  }

  /**
   * Bulk enable users
   */
  async bulkEnable(userIds: string[]) {
    const promises = userIds.map((userId) => this.updateStatus(userId, true));
    return await Promise.allSettled(promises);
  }

  /**
   * Bulk delete users
   */
  async bulkDelete(userIds: string[]) {
    const promises = userIds.map((userId) => this.delete(userId));
    return await Promise.allSettled(promises);
  }

  /**
   * Get active users count
   */
  async getActiveUsersCount() {
    const client = await this.getClient();
    const queries = [Query.equal("status", [true]), Query.limit(1)];
    const result = await client.users.list(queries);
    return result.total;
  }

  /**
   * Get verified users count
   */
  async getVerifiedUsersCount() {
    const client = await this.getClient();
    const queries = [Query.equal("emailVerification", [true]), Query.limit(1)];
    const result = await client.users.list(queries);
    return result.total;
  }

  /**
   * Get users created in date range
   */
  async getUsersByDateRange(startDate: string, endDate: string) {
    const client = await this.getClient();
    const queries = [
      Query.greaterThanEqual("$createdAt", startDate),
      Query.lessThanEqual("$createdAt", endDate),
    ];
    return await client.users.list(queries);
  }

  /**
   * Get recently created users
   */
  async getRecentUsers(limit: number = 10) {
    const client = await this.getClient();
    const queries = [Query.orderDesc("$createdAt"), Query.limit(limit)];
    return await client.users.list(queries);
  }
}
