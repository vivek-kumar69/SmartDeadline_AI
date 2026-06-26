import { Task, RiskDetails } from "./types";

export function hoursUntil(deadline: string): number {
  if (!deadline) return 0;
  return (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60);
}

export function getPriorityScore(task: Task): number {
  if (task.done) return 0;
  const hoursLeft = Math.max(hoursUntil(task.deadline), 0.5);
  // Urgency boost
  const urgencyBoost = hoursLeft < 12 ? 55 : hoursLeft < 24 ? 40 : hoursLeft < 72 ? 24 : 8;
  // Score formula
  return Math.round(
    Number(task.importance) * 18 +
    Number(task.effort) * 8 +
    urgencyBoost -
    Math.min(hoursLeft / 8, 18)
  );
}

export function getStatus(task: Task): { label: string; level: "urgent" | "soon" | "safe" } {
  if (task.done) return { label: "Done", level: "safe" };
  const hoursLeft = hoursUntil(task.deadline);
  if (hoursLeft <= 0) return { label: "Overdue", level: "urgent" };
  if (hoursLeft <= 12) return { label: "Urgent", level: "urgent" };
  if (hoursLeft <= 48) return { label: "Soon", level: "soon" };
  return { label: "Planned", level: "safe" };
}

export function getRisk(task: Task): RiskDetails {
  if (task.done) {
    return {
      label: "Safe",
      level: "safe",
      reason: "Already completed.",
      suggestion: "Use this momentum on your next open commitment."
    };
  }

  const hoursLeft = hoursUntil(task.deadline);
  const effort = Number(task.effort);
  const importance = Number(task.importance);

  if (hoursLeft <= 0) {
    return {
      label: "Overdue",
      level: "high",
      reason: "The deadline has already passed.",
      suggestion: "Create the minimum acceptable version and submit or request an extension immediately."
    };
  }

  if (hoursLeft <= 12 || (hoursLeft <= 24 && importance >= 4) || (hoursLeft <= 48 && effort >= 3 && importance >= 4)) {
    return {
      label: "High Risk",
      level: "high",
      reason: "Task is highly critical with minimal time remaining.",
      suggestion: "Block focused calendar time now, implement the core path, and defer all minor details."
    };
  }

  if (hoursLeft <= 72 || effort >= 3 || importance >= 5) {
    return {
      label: "Medium Risk",
      level: "medium",
      reason: "Task is manageable, but further delay will trigger a last-minute rush.",
      suggestion: "Schedule one deep work block today and define a clear milestone checklist."
    };
  }

  return {
    label: "Safe",
    level: "safe",
    reason: "There is ample time remaining if started systematically.",
    suggestion: "Keep a daily eye on this and draft a quick outline before diving in."
  };
}

export function formatDeadline(deadline: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(deadline));
  } catch {
    return deadline;
  }
}

export function buildPlan(task: Task): string {
  if (task.aiPlan) return task.aiPlan;

  const hoursLeft = hoursUntil(task.deadline);
  const effort = Number(task.effort);

  if (task.done) {
    return "Completed. Keep this as proof of progress and move to the next highest-priority task.";
  }

  if (hoursLeft <= 0) {
    return "The deadline has passed. Work in one hyper-focused sprint to get a minimal viable output done immediately.";
  }

  if (hoursLeft <= 6) {
    return "Define the minimum acceptable result, then work in a single 90-minute hyper-focused sprint. Cut all optional items.";
  }

  if (hoursLeft <= 24) {
    return "Split into two blocks today: Block 1 to complete the main bulk of requirements; Block 2 for final revision and delivery.";
  }

  if (effort >= 3) {
    return "Establish deep-work sessions. Build the hardest technical or creative portion first, then clean up the remainder.";
  }

  return "Schedule a short work block, complete the primary task objectives, and run a fast review right before submission.";
}

export interface ParsedPlan {
  priority?: string;
  steps: string[];
  warning?: string;
  isParsed: boolean;
}

export function parseRescuePlan(planText: string): ParsedPlan {
  if (!planText) return { steps: [], isParsed: false };

  const lines = planText.split("\n");
  let priority = "";
  const steps: string[] = [];
  let warning = "";
  let isParsed = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const lower = trimmed.toLowerCase();
    if (lower.startsWith("priority:")) {
      priority = trimmed.substring(trimmed.indexOf(":") + 1).trim();
      isParsed = true;
    } else if (lower.startsWith("step 1:") || lower.startsWith("step1:")) {
      steps.push(trimmed.substring(trimmed.indexOf(":") + 1).trim());
      isParsed = true;
    } else if (lower.startsWith("step 2:") || lower.startsWith("step2:")) {
      steps.push(trimmed.substring(trimmed.indexOf(":") + 1).trim());
      isParsed = true;
    } else if (lower.startsWith("step 3:") || lower.startsWith("step3:")) {
      steps.push(trimmed.substring(trimmed.indexOf(":") + 1).trim());
      isParsed = true;
    } else if (lower.startsWith("warning:")) {
      warning = trimmed.substring(trimmed.indexOf(":") + 1).trim();
      isParsed = true;
    }
  }

  // If standard parse failed to extract steps, try a fallback regex-based extractor
  if (steps.length === 0) {
    const stepRegex = /^(?:step\s*\d+[:.]?|[-*•]|\d+\.)\s*(.*)/i;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().startsWith("priority:") || trimmed.toLowerCase().startsWith("warning:")) {
        continue;
      }
      const match = trimmed.match(stepRegex);
      if (match && match[1]) {
        steps.push(match[1].trim());
      }
    }
  }

  return {
    priority: priority || undefined,
    steps: steps.filter(Boolean),
    warning: warning && warning.toLowerCase() !== "no major risk" && warning.toLowerCase() !== "no major risk." ? warning : undefined,
    isParsed: isParsed && steps.length > 0
  };
}

export interface ScheduleItem {
  time: string;
  activity: string;
}

export function parseDailySchedule(scheduleText: string): ScheduleItem[] {
  if (!scheduleText) return [];
  const lines = scheduleText.split("\n");
  const items: ScheduleItem[] = [];

  // Matches format like "09:00 - 10:00: Activity" or "9:00 AM - 10:00 AM: Activity" or "09:00-10:00 - Activity"
  const timeActivityRegex = /^([0-9]{1,2}:[0-9]{2}(?:\s*(?:-|to)\s*[0-9]{1,2}:[0-9]{2})?(?:\s*[APap][Mm])?)\s*[:\-\u2013\u2014]\s*(.*)$/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const cleanLine = trimmed.replace(/^[-*•+\s]+/, "").trim(); // strip bullets
    if (!cleanLine) continue;

    const match = cleanLine.match(timeActivityRegex);
    if (match) {
      items.push({
        time: match[1].trim(),
        activity: match[2].trim()
      });
    } else {
      const colonIndex = cleanLine.indexOf(":");
      if (colonIndex > 0 && colonIndex < 25) {
        const possibleTime = cleanLine.slice(0, colonIndex).trim();
        if (/\d+/.test(possibleTime) && (possibleTime.toLowerCase().includes("am") || possibleTime.toLowerCase().includes("pm") || possibleTime.includes(":") || possibleTime.toLowerCase().includes("hour"))) {
          items.push({
            time: possibleTime,
            activity: cleanLine.slice(colonIndex + 1).trim()
          });
          continue;
        }
      }
      
      // Fallback for general milestones
      if (cleanLine.length > 3 && !cleanLine.startsWith("#") && !cleanLine.startsWith("Here")) {
        items.push({
          time: "Task Block",
          activity: cleanLine
        });
      }
    }
  }
  return items;
}


