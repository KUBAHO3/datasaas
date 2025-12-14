import "server-only";

import { FormSubmissionAdminModel } from "../models/form-submission.model";
import { SubmissionValueAdminModel } from "../models/submission-value.model";
import { SubmissionAnalytics, FieldAnalytics } from "@/lib/types/submission-types";
import { Form } from "@/lib/types/form-types";

export class SubmissionAnalyticsService {
  /**
   * Get comprehensive analytics for a form
   */
  async getFormAnalytics(
    formId: string,
    companyId: string
  ): Promise<SubmissionAnalytics> {
    const submissionModel = new FormSubmissionAdminModel();

    // Get all submissions for the form
    const allSubmissions = await submissionModel.listByForm(formId);
    const completed = allSubmissions.filter((s) => s.status === "completed");
    const drafts = allSubmissions.filter((s) => s.status === "draft");

    // Calculate conversion rate
    const conversionRate =
      allSubmissions.length > 0
        ? (completed.length / allSubmissions.length) * 100
        : 0;

    // Calculate average completion time (completed - started)
    let totalTime = 0;
    let countWithTime = 0;

    completed.forEach((submission) => {
      if (submission.submittedAt && submission.startedAt) {
        const started = new Date(submission.startedAt).getTime();
        const submitted = new Date(submission.submittedAt).getTime();
        totalTime += submitted - started;
        countWithTime++;
      }
    });

    const averageCompletionTime =
      countWithTime > 0 ? totalTime / countWithTime / 1000 : 0; // in seconds

    // Get submissions by date (last 30 days)
    const submissionsByDate = this.getSubmissionsByDate(
      allSubmissions,
      30
    );

    return {
      totalSubmissions: allSubmissions.length,
      completedSubmissions: completed.length,
      draftSubmissions: drafts.length,
      conversionRate,
      averageCompletionTime,
      submissionsByDate,
    };
  }

  /**
   * Get submissions grouped by date
   */
  private getSubmissionsByDate(
    submissions: any[],
    days: number
  ): { date: string; count: number }[] {
    const now = new Date();
    const dateMap = new Map<string, number>();

    // Initialize all dates with 0
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      dateMap.set(dateStr, 0);
    }

    // Count submissions by date
    submissions.forEach((submission) => {
      const submittedAt = submission.submittedAt || submission.$createdAt;
      if (submittedAt) {
        const dateStr = new Date(submittedAt).toISOString().split("T")[0];
        if (dateMap.has(dateStr)) {
          dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
        }
      }
    });

    return Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get field-level analytics
   */
  async getFieldAnalytics(
    formId: string,
    companyId: string,
    form: Form
  ): Promise<FieldAnalytics[]> {
    const valueModel = new SubmissionValueAdminModel();
    const fieldAnalytics: FieldAnalytics[] = [];

    for (const field of form.fields) {
      // Skip non-input fields
      if (
        field.type === "section_header" ||
        field.type === "divider" ||
        field.type === "rich_text"
      ) {
        continue;
      }

      // Get all values for this field
      const values = await valueModel.queryValues([
        { field: "formId", operator: "equals", value: formId },
        { field: "fieldId", operator: "equals", value: field.id },
        { field: "companyId", operator: "equals", value: companyId },
      ]);

      const analytics: FieldAnalytics = {
        fieldId: field.id,
        fieldLabel: field.label,
        fieldType: field.type,
        totalResponses: values.length,
      };

      // Calculate distribution for categorical fields
      if (
        field.type === "dropdown" ||
        field.type === "radio" ||
        field.type === "checkbox" ||
        field.type === "multi_select"
      ) {
        const distribution = new Map<string, number>();
        values.forEach((v) => {
          const val = v.valueText || v.valueArray?.[0] || "No response";
          distribution.set(val, (distribution.get(val) || 0) + 1);
        });

        analytics.uniqueValues = distribution.size;
        analytics.distribution = Array.from(distribution.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10); // Top 10

        if (analytics.distribution.length > 0) {
          analytics.mostCommonValue = analytics.distribution[0].value;
        }
      }

      // Calculate numeric stats for number fields
      if (field.type === "number" || field.type === "currency" || field.type === "rating" || field.type === "scale") {
        const numbers = values
          .map((v) => v.valueNumber)
          .filter((n): n is number => typeof n === "number");

        if (numbers.length > 0) {
          const sorted = numbers.sort((a, b) => a - b);
          const sum = numbers.reduce((acc, n) => acc + n, 0);

          analytics.numericStats = {
            min: sorted[0],
            max: sorted[sorted.length - 1],
            avg: sum / numbers.length,
            median:
              numbers.length % 2 === 0
                ? (sorted[numbers.length / 2 - 1] + sorted[numbers.length / 2]) / 2
                : sorted[Math.floor(numbers.length / 2)],
          };
        }
      }

      fieldAnalytics.push(analytics);
    }

    return fieldAnalytics;
  }

  /**
   * Get company-wide analytics
   */
  async getCompanyAnalytics(companyId: string) {
    const submissionModel = new FormSubmissionAdminModel();

    // This would need a method to get all submissions by company
    // For now, return basic structure
    return {
      totalForms: 0,
      totalSubmissions: 0,
      completedSubmissions: 0,
      draftSubmissions: 0,
      submissionsThisMonth: 0,
      submissionsLastMonth: 0,
    };
  }
}
