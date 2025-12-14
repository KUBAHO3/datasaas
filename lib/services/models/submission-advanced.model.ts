import "server-only";

import {
  FormSubmission,
  SubmissionValue,
  SubmissionRow,
  FilterCondition,
  FilterGroup,
  SubmissionFilterQuery,
} from "@/lib/types/submission-types";
import { AdminDBModel } from "../core/base-db-model";
import { DATABASE_ID, FORM_SUBMISSIONS_TABLE_ID } from "@/lib/env-config";
import { SubmissionHelpers } from "@/lib/utils/submission-utils";
import { Query } from "node-appwrite";
import { SubmissionValueAdminModel } from "./submission-value.model";

export class SubmissionAdvancedModel extends AdminDBModel<FormSubmission> {
  private valueModel: SubmissionValueAdminModel;

  constructor() {
    super(DATABASE_ID, FORM_SUBMISSIONS_TABLE_ID);
    this.valueModel = new SubmissionValueAdminModel();
  }

  private buildSubmissionQueries(filterQuery: SubmissionFilterQuery): string[] {
    const queries: string[] = [];

    if (filterQuery.formId) {
      queries.push(Query.equal("formId", filterQuery.formId));
    }

    if (filterQuery.status) {
      queries.push(Query.equal("status", filterQuery.status));
    }

    if (filterQuery.dateRange) {
      queries.push(
        Query.greaterThanEqual("submittedAt", filterQuery.dateRange.start)
      );
      queries.push(
        Query.lessThanEqual("submittedAt", filterQuery.dateRange.end)
      );
    }

    if (filterQuery.sort && filterQuery.sort.length > 0) {
      const firstSort = filterQuery.sort[0];
      const systemFields = ["$id", "$createdAt", "submittedAt", "status"];
      if (systemFields.includes(firstSort.fieldId)) {
        if (firstSort.direction === "asc") {
          queries.push(Query.orderAsc(firstSort.fieldId));
        } else {
          queries.push(Query.orderDesc(firstSort.fieldId));
        }
      }
    } else {
      queries.push(Query.orderDesc("submittedAt"));
    }

    queries.push(Query.limit(filterQuery.limit || 50));
    queries.push(Query.offset(filterQuery.offset || 0));

    return queries;
  }

  private buildValueQueries(
    formId: string,
    companyId: string,
    filters?: FilterGroup[]
  ): string[] {
    const queries: string[] = [
      Query.equal("formId", formId),
      Query.equal("companyId", companyId),
      Query.limit(1000), // Adjust based on expected volume
    ];

    if (!filters || filters.length === 0) {
      return queries;
    }

    const firstGroup = filters[0];
    firstGroup.conditions.forEach((condition) => {
      const query = this.buildValueQuery(condition);
      if (query) queries.push(query);
    });

    return queries;
  }

  private buildValueQuery(condition: FilterCondition): string | null {
    const fieldId = condition.fieldId;

    if (
      [
        "equals",
        "notEquals",
        "contains",
        "notContains",
        "startsWith",
        "endsWith",
      ].includes(condition.operator)
    ) {
      switch (condition.operator) {
        case "equals":
          return Query.equal("valueText", condition.value);
        case "notEquals":
          return Query.notEqual("valueText", condition.value);
        case "contains":
          return Query.search("valueText", condition.value);
        case "startsWith":
          return Query.startsWith("valueText", condition.value);
        case "endsWith":
          return Query.endsWith("valueText", condition.value);
      }
    }

    if (
      [
        "greaterThan",
        "greaterThanOrEqual",
        "lessThan",
        "lessThanOrEqual",
        "between",
      ].includes(condition.operator)
    ) {
      switch (condition.operator) {
        case "greaterThan":
          return Query.greaterThan("valueNumber", condition.value);
        case "greaterThanOrEqual":
          return Query.greaterThanEqual("valueNumber", condition.value);
        case "lessThan":
          return Query.lessThan("valueNumber", condition.value);
        case "lessThanOrEqual":
          return Query.lessThanEqual("valueNumber", condition.value);
      }
    }

    // For boolean fields
    if (condition.operator === "equals") {
      return Query.equal("valueBoolean", condition.value);
    }

    // For null checks
    if (condition.operator === "isNull") {
      return Query.isNull("valueText");
    }
    if (condition.operator === "isNotNull") {
      return Query.isNotNull("valueText");
    }

    return null;
  }

  /**
   * Advanced query with filtering
   */
  async querySubmissions(
    companyId: string,
    filterQuery: SubmissionFilterQuery
  ): Promise<{ rows: SubmissionRow[]; total: number }> {
    // Step 1: Get filtered submissions
    const submissionQueries = this.buildSubmissionQueries(filterQuery);
    submissionQueries.push(Query.equal("companyId", companyId));

    const client = await this.getClient();
    const submissionsResult = await client.databases.listDocuments(
      this.databaseId,
      this.collectionId,
      submissionQueries
    );

    let submissions = submissionsResult.documents.map(SubmissionHelpers.fromDB);

    // Step 2: If filtering by field values, get relevant values
    if (filterQuery.filters && filterQuery.filters.length > 0) {
      const valueQueries = this.buildValueQueries(
        filterQuery.formId!,
        companyId,
        filterQuery.filters
      );

      const valuesResult = await this.valueModel.queryValues(valueQueries);

      // Get unique submission IDs from filtered values
      const filteredSubmissionIds = new Set(
        valuesResult.map((v) => v.submissionId)
      );

      // Filter submissions to only those with matching values
      submissions = submissions.filter((s) => filteredSubmissionIds.has(s.$id));
    }

    // Step 3: Get all values for remaining submissions
    const rows: SubmissionRow[] = [];
    for (const submission of submissions) {
      const values = await this.valueModel.getBySubmissionId(submission.$id);
      rows.push(SubmissionHelpers.toRow(submission, values));
    }

    return {
      rows,
      total: rows.length,
    };
  }

  async getGroupedData(
    companyId: string,
    formId: string,
    fieldId: string
  ): Promise<Record<string, number>> {
    const queries = [
      Query.equal("companyId", companyId),
      Query.equal("formId", formId),
      Query.equal("fieldId", fieldId),
      Query.limit(1000),
    ];

    const values = await this.valueModel.queryValues(queries);
    const grouped: Record<string, number> = {};

    values.forEach((value: any) => {
      const key = String(SubmissionHelpers.extractValue(value) || "Unknown");
      grouped[key] = (grouped[key] || 0) + 1;
    });

    return grouped;
  }
}
