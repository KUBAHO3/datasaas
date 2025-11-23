import { DATABASE_ID, ONBOARDING_TABLE_ID } from "@/lib/env-config";
import { AdminDBModel, SessionDBModel } from "../core/base-db-model";
import { OnboardingProgress } from "@/lib/types/onboarding-types";

export class OnboardingSessionModel extends SessionDBModel<OnboardingProgress> {
  constructor() {
    super(DATABASE_ID, ONBOARDING_TABLE_ID);
  }

  async findByUserId(userId: string): Promise<OnboardingProgress | null> {
    return this.findOne({
      where: [{ field: "userId", operator: "equals", value: userId }],
    });
  }
}

export class OnboardingAdminModel extends AdminDBModel<OnboardingProgress> {
  constructor() {
    super(DATABASE_ID, ONBOARDING_TABLE_ID);
  }

  async findByUserId(userId: string): Promise<OnboardingProgress | null> {
    return this.findOne({
      where: [{ field: "userId", operator: "equals", value: userId }],
    });
  }

  async createProgress(userId: string): Promise<OnboardingProgress> {
    return this.create(
      {
        userId,
        currentStep: 2,
        completedSteps: [1],
        status: "in_progress",
      },
      userId
    );
  }

  async updateProgress(
    userId: string,
    data: Partial<OnboardingProgress>
  ): Promise<OnboardingProgress> {
    return this.updateById(userId, data);
  }
}
