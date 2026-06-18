import type { StudyPlan } from "@prisma/client";
import {
  buildDatedStudyCalendar,
  calculateCalendarProgress,
  parseAiStudyPlan,
  parseJsonArray,
  type SerializedStudyPlan
} from "@/lib/types";

export function serializeStudyPlan(plan: StudyPlan): SerializedStudyPlan {
  const aiResponse = parseAiStudyPlan(plan.aiResponse);
  const completedSessions = parseJsonArray(plan.completedSessions);
  const availableDays = parseJsonArray(plan.availableDays);
  const calendar = buildDatedStudyCalendar(
    aiResponse,
    plan.deadline.toISOString(),
    availableDays,
    plan.createdAt.toISOString(),
    parseJsonArray(plan.subjects),
    plan.objective
  );
  const progress = calculateCalendarProgress(calendar, completedSessions);

  return {
    id: plan.id,
    userId: plan.userId,
    objective: plan.objective,
    deadline: plan.deadline.toISOString(),
    subjects: parseJsonArray(plan.subjects),
    availableDays,
    hoursPerDay: plan.hoursPerDay,
    level: plan.level,
    preference: plan.preference,
    aiResponse,
    completedSessions,
    ...progress,
    createdAt: plan.createdAt.toISOString()
  };
}
