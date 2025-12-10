import { Permission, Role } from "node-appwrite";
import { Form, FormField, FormSubmission } from "../types/form-types";

export const FormHelpers = {
  toDB(form: Partial<Form>): any {
    const dbForm: any = { ...form };

    if (form.fields) dbForm.fields = JSON.stringify(form.fields);
    if (form.steps) dbForm.steps = JSON.stringify(form.steps);
    if (form.conditionalLogic)
      dbForm.conditionalLogic = JSON.stringify(form.conditionalLogic);
    if (form.settings) dbForm.settings = JSON.stringify(form.settings);
    if (form.theme) dbForm.theme = JSON.stringify(form.theme);
    if (form.accessControl)
      dbForm.accessControl = JSON.stringify(form.accessControl);
    if (form.metadata) dbForm.metadata = JSON.stringify(form.metadata);

    return dbForm;
  },

  fromDB(dbForm: any): Form {
    const form: any = { ...dbForm };

    try {
      if (typeof form.fields === "string")
        form.fields = JSON.parse(form.fields);
      if (typeof form.steps === "string") form.steps = JSON.parse(form.steps);
      if (typeof form.conditionalLogic === "string")
        form.conditionalLogic = JSON.parse(form.conditionalLogic);
      if (typeof form.settings === "string")
        form.settings = JSON.parse(form.settings);
      if (typeof form.theme === "string") form.theme = JSON.parse(form.theme);
      if (typeof form.accessControl === "string")
        form.accessControl = JSON.parse(form.accessControl);
      if (typeof form.metadata === "string")
        form.metadata = JSON.parse(form.metadata);
    } catch (error) {
      console.error("Error parsing form JSON fields:", error);
    }

    return form as Form;
  },
};

export const SubmissionHelpers = {
  toDB(submission: Partial<FormSubmission>): any {
    const dbSubmission: any = { ...submission };

    if (submission.data) dbSubmission.data = JSON.stringify(submission.data);
    if (submission.fileUploads)
      dbSubmission.fileUploads = JSON.stringify(submission.fileUploads);

    return dbSubmission;
  },

  fromDB(dbSubmission: any): FormSubmission {
    const submission: any = { ...dbSubmission };

    try {
      if (typeof submission.data === "string")
        submission.data = JSON.parse(submission.data);
      if (typeof submission.fileUploads === "string")
        submission.fileUploads = JSON.parse(submission.fileUploads);
    } catch (error) {
      console.error("Error parsing submission JSON fields:", error);
    }

    return submission as FormSubmission;
  },
};

export function createDefaultField(type: string, order: number): FormField {
  const baseField = {
    id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    label: `${type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())} Field`,
    description: "",
    placeholder: "",
    required: false,
    validation: [],
    layout: { width: "full" as const, columns: 1 },
    order,
  };

  return baseField as FormField;
}

export function generateFormPermissions(
  form: any,
  teamId: string,
  ownerId: string
): string[] {
  const permissions: string[] = [];
  if (form.accessControl?.visibility === "public" || form.settings?.isPublic) {
    permissions.push(Permission.read(Role.any()));
  } else {
    permissions.push(Permission.read(Role.team(teamId)));
  }
  permissions.push(Permission.update(Role.user(ownerId)));
  permissions.push(Permission.update(Role.team(teamId, "owner")));
  permissions.push(Permission.update(Role.team(teamId, "admin")));

  permissions.push(Permission.delete(Role.user(ownerId)));

  permissions.push(Permission.delete(Role.team(teamId, "owner")));

  return permissions;
}
