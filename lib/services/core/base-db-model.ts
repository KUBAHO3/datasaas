import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "./appwrite";

export type WhereClause = {
  field: string;
  operator:
    | "equals"
    | "notEquals"
    | "lessThan"
    | "lessThanEqual"
    | "greaterThan"
    | "greaterThanEqual"
    | "contains"
    | "startsWith"
    | "endsWith"
    | "isNull"
    | "isNotNull"
    | "between"
    | "in";
  value?: any;
};

export type FindOptions = {
  where?: WhereClause[];
  orderBy?: { field: string; direction: "asc" | "desc" }[];
  limit?: number;
  offset?: number;
  select?: string[];
};

export type UpdateData = {
  [key: string]: any;
};

function buildQueries(where?: WhereClause[]): string[] {
  if (!where || where.length === 0) return [];

  return where.map((clause) => {
    switch (clause.operator) {
      case "equals":
        return Query.equal(clause.field, clause.value);
      case "notEquals":
        return Query.notEqual(clause.field, clause.value);
      case "lessThan":
        return Query.lessThan(clause.field, clause.value);
      case "lessThanEqual":
        return Query.lessThanEqual(clause.field, clause.value);
      case "greaterThan":
        return Query.greaterThan(clause.field, clause.value);
      case "greaterThanEqual":
        return Query.greaterThanEqual(clause.field, clause.value);
      case "contains":
        return Query.search(clause.field, clause.value);
      case "startsWith":
        return Query.startsWith(clause.field, clause.value);
      case "endsWith":
        return Query.endsWith(clause.field, clause.value);
      case "isNull":
        return Query.isNull(clause.field);
      case "isNotNull":
        return Query.isNotNull(clause.field);
      case "between":
        return Query.between(clause.field, clause.value[0], clause.value[1]);
      case "in":
        return Query.equal(clause.field, clause.value);
      default:
        throw new Error(`Unsupported operator: ${clause.operator}`);
    }
  });
}

abstract class BaseDBModel<T = any> {
  protected databaseId: string;
  protected collectionId: string;

  constructor(databaseId: string, collectionId: string) {
    this.databaseId = databaseId;
    this.collectionId = collectionId;
  }

  protected abstract getClient(): Promise<any>;

  async findMany(options: FindOptions = {}): Promise<T[]> {
    const client = await this.getClient();
    const queries: string[] = [];

    if (options.where) {
      queries.push(...buildQueries(options.where));
    }

    if (options.orderBy) {
      options.orderBy.forEach((order) => {
        queries.push(
          order.direction === "asc"
            ? Query.orderAsc(order.field)
            : Query.orderDesc(order.field)
        );
      });
    }

    if (options.limit) {
      queries.push(Query.limit(options.limit));
    }

    if (options.offset) {
      queries.push(Query.offset(options.offset));
    }

    if (options.select && options.select.length > 0) {
      queries.push(Query.select(options.select));
    }

    const response = await client.databases.listDocuments(
      this.databaseId,
      this.collectionId,
      queries.length > 0 ? queries : undefined
    );

    return response.documents as T[];
  }

  async findOne(options: FindOptions = {}): Promise<T | null> {
    const results = await this.findMany({ ...options, limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  async findById(documentId: string): Promise<T | null> {
    try {
      const client = await this.getClient();
      const response = await client.databases.getDocument(
        this.databaseId,
        this.collectionId,
        documentId
      );
      return response as T;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  }

  async count(options: FindOptions = {}): Promise<number> {
    const queries: string[] = [];

    if (options.where) {
      queries.push(...buildQueries(options.where));
    }

    const client = await this.getClient();
    const response = await client.databases.listDocuments(
      this.databaseId,
      this.collectionId,
      queries.length > 0 ? queries : undefined
    );

    return response.total;
  }
}

export class SessionDBModel<T = any> extends BaseDBModel<T> {
  constructor(databaseId: string, collectionId: string) {
    super(databaseId, collectionId);
  }

  protected async getClient() {
    return await createSessionClient();
  }

  async create(
    data: Partial<T>,
    documentId?: string,
    permissions?: string[]
  ): Promise<T> {
    const client = await this.getClient();
    const response = await client.databases.createDocument(
      this.databaseId,
      this.collectionId,
      documentId || ID.unique(),
      data,
      permissions
    );

    return response as T;
  }

  async updateById(
    documentId: string,
    data: UpdateData,
    permissions?: string[]
  ): Promise<T> {
    const client = await this.getClient();
    const response = await client.databases.updateDocument(
      this.databaseId,
      this.collectionId,
      documentId,
      data,
      permissions
    );
    return response as T;
  }

  async updateMany(options: FindOptions, data: UpdateData) {
    const documents = await this.findMany(options);
    const client = await this.getClient();

    const updatePromises = documents.map((doc: any) =>
      client.databases.updateDocument(
        this.databaseId,
        this.collectionId,
        doc.$id,
        data
      )
    );

    return await Promise.all(updatePromises);
  }

  async deleteById(documentId: string): Promise<void> {
    const client = await this.getClient();
    await client.databases.deleteDocument(
      this.databaseId,
      this.collectionId,
      documentId
    );
  }

  async deleteMany(options: FindOptions): Promise<number> {
    const documents = await this.findMany(options);
    const client = await this.getClient();

    const deletePromises = documents.map((doc: any) =>
      client.databases.deleteDocument(
        this.databaseId,
        this.collectionId,
        doc.$id
      )
    );

    await Promise.all(deletePromises);
    return documents.length;
  }
}

export class AdminDBModel<T = any> extends BaseDBModel<T> {
  constructor(databaseId: string, collectionId: string) {
    super(databaseId, collectionId);
  }

  protected async getClient() {
    return await createAdminClient();
  }

  async create(
    data: Partial<T>,
    documentId?: string,
    permissions?: string[]
  ): Promise<T> {
    const client = await this.getClient();
    const response = await client.databases.createDocument(
      this.databaseId,
      this.collectionId,
      documentId || ID.unique(),
      data,
      permissions
    );
    return response as T;
  }

  async updateById(
    documentId: string,
    data: UpdateData,
    permissions?: string[]
  ): Promise<T> {
    const client = await this.getClient();
    const response = await client.databases.updateDocument(
      this.databaseId,
      this.collectionId,
      documentId,
      data,
      permissions
    );
    return response as T;
  }

  async updateMany(options: FindOptions, data: UpdateData) {
    const documents = await this.findMany(options);
    const client = await this.getClient();

    const updatePromises = documents.map((doc: any) =>
      client.databases.updateDocument(
        this.databaseId,
        this.collectionId,
        doc.$id,
        data
      )
    );

    return await Promise.all(updatePromises);
  }

  async deleteById(documentId: string): Promise<void> {
    const client = await this.getClient();
    await client.databases.deleteDocument(
      this.databaseId,
      this.collectionId,
      documentId
    );
  }

  async deleteMany(options: FindOptions): Promise<number> {
    const documents = await this.findMany(options);
    const client = await this.getClient();

    const deletePromises = documents.map((doc: any) =>
      client.databases.deleteDocument(
        this.databaseId,
        this.collectionId,
        doc.$id
      )
    );

    await Promise.all(deletePromises);
    return documents.length;
  }
}
