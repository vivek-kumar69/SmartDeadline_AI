export interface Task {
  id: string;
  title: string;
  deadline: string; // datetime-local format: YYYY-MM-DDTHH:MM
  importance: string; // "5", "4", "3", "2", "1"
  effort: string; // "3", "2", "1"
  notes: string;
  done: boolean;
  createdAt: string;
  aiPlan?: string;
}

export interface RiskDetails {
  label: string;
  level: "high" | "medium" | "safe";
  reason: string;
  suggestion: string;
}
