import {
  Form,
  FormAccessControl,
  FormMetadata,
  FormSettings,
  FormTheme,
} from "@/lib/types/form-types";
import { AdminDBModel, SessionDBModel } from "../core/base-db-model";
import { DATABASE_ID, FORMS_TABLE_ID } from "@/lib/env-config";
import { FormHelpers } from "@/lib/utils/forms-utils";
import { ID } from "node-appwrite";

export class FormSessionModel extends SessionDBModel<Form> {
  constructor() {
    super(DATABASE_ID, FORMS_TABLE_ID);
  }

  async create(data: Partial<Form>, userId: string): Promise<Form> {
    const dbData = FormHelpers.toDB(data);
    const result = await super.create(dbData, ID.unique());
    return FormHelpers.fromDB(result);
  }

  async updateById(id: string, data: Partial<Form>): Promise<Form> {
    const dbData = FormHelpers.toDB(data);
    const result = await super.updateById(id, dbData);
    return FormHelpers.fromDB(result);
  }

  async findById(id: string): Promise<Form | null> {
    const result = await super.findById(id);
    return result ? FormHelpers.fromDB(result) : null;
  }

  async findMany(options: any): Promise<Form[]> {
    const results = await super.findMany(options);
    return results.map(FormHelpers.fromDB);
  }

  async listByCompany(
    companyId: string,
    status?: "draft" | "published" | "archived"
  ): Promise<Form[]> {
    const where: any[] = [
      { field: "companyId", operator: "equals", value: companyId },
    ];

    if (status) {
      where.push({ field: "status", operator: "equals", value: status });
    }

    return this.findMany({
      where,
      orderBy: [{ field: "$createdAt", direction: "desc" }],
    });
  }
}

export class FormAdminModel extends AdminDBModel<Form> {
  constructor() {
    super(DATABASE_ID, FORMS_TABLE_ID);
  }

  async create(data: Partial<Form>, documentId?: string): Promise<Form> {
    const dbData = FormHelpers.toDB(data);
    const result = await super.create(dbData, documentId || ID.unique());
    return FormHelpers.fromDB(result);
  }

  async updateById(id: string, data: Partial<Form>): Promise<Form> {
    const dbData = FormHelpers.toDB(data);
    const result = await super.updateById(id, dbData);
    return FormHelpers.fromDB(result);
  }

  async findById(id: string): Promise<Form | null> {
    const result = await super.findById(id);
    return result ? FormHelpers.fromDB(result) : null;
  }

  async findMany(options: any): Promise<Form[]> {
    const results = await super.findMany(options);
    return results.map(FormHelpers.fromDB);
  }

  async listByCompany(
    companyId: string,
    status?: "draft" | "published" | "archived"
  ): Promise<Form[]> {
    const where: any[] = [
      { field: "companyId", operator: "equals", value: companyId },
    ];

    if (status) {
      where.push({ field: "status", operator: "equals", value: status });
    }

    return this.findMany({
      where,
      orderBy: [{ field: "$createdAt", direction: "desc" }],
    });
  }

  async createFormWithDefaults(
    companyId: string,
    userId: string,
    name: string,
    description?: string
  ): Promise<Form> {
    const defaultSettings: FormSettings = {
      isPublic: false,
      allowAnonymous: false,
      requireLogin: true,
      allowEdit: false,
      allowMultipleSubmissions: false,
      showProgressBar: true,
      showQuestionNumbers: true,
      shuffleQuestions: false,
      confirmationMessage: "Thank you for your submission!",
      enableNotifications: false,
      notificationEmails: [],
      enableAutoSave: true,
      autoSaveInterval: 30,
      collectEmail: true,
      collectIpAddress: false,
      enableRecaptcha: false,
    };

    const defaultTheme: FormTheme = {
      primaryColor: "#1e293b",
      backgroundColor: "#ffffff",
      fontFamily: "Inter",
      fontSize: "16px",
      buttonStyle: "rounded",
      showProgressBar: true,
    };

    const defaultAccessControl: FormAccessControl = {
      visibility: "private",
    };

    const defaultMetadata: FormMetadata = {
      totalFields: 0,
      totalSteps: 1,
      estimatedTime: 5,
      responseCount: 0,
    };

    return this.create({
      companyId,
      name,
      description,
      status: "draft",
      version: 1,
      isTemplate: false,
      fields: [],
      steps: [
        {
          id: "step-1",
          title: "Step 1",
          description: "",
          fields: [],
          order: 1,
        },
      ],
      conditionalLogic: [],
      settings: defaultSettings,
      theme: defaultTheme,
      accessControl: defaultAccessControl,
      metadata: defaultMetadata,
      createdBy: userId,
      updatedBy: userId,
    });
  }
}
