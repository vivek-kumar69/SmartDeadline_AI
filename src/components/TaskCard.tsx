import { useState } from "react";
import { Task } from "../types";
import { getPriorityScore, getStatus, formatDeadline, buildPlan, parseRescuePlan } from "../utils";
import { Check, Trash2, Sparkles, AlertCircle, Clock, Calendar, ShieldCheck, Zap, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";

interface TaskCardProps {
  key?: string;
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onGenerateAIPlan: (id: string) => Promise<void>;
  generatingAIPlanId: string | null;
}

export default function TaskCard({
  task,
  onToggleComplete,
  onDelete,
  onGenerateAIPlan,
  generatingAIPlanId
}: TaskCardProps) {
  const score = getPriorityScore(task);
  const status = getStatus(task);
  const isGenerating = generatingAIPlanId === task.id;

  // Track checked steps in local state
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Render status badge colors
  const statusColors = {
    urgent: {
      bg: "bg-rose-50/80 border-rose-100",
      text: "text-rose-700",
      icon: <AlertCircle size={14} className="text-rose-600 animate-pulse" />
    },
    soon: {
      bg: "bg-amber-50/80 border-amber-100",
      text: "text-amber-700",
      icon: <Clock size={14} className="text-amber-600" />
    },
    safe: {
      bg: "bg-emerald-50/80 border-emerald-100",
      text: "text-emerald-700",
      icon: <ShieldCheck size={14} className="text-emerald-600" />
    }
  }[status.level];

  const rawPlanText = buildPlan(task);
  const parsed = parseRescuePlan(rawPlanText);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative group bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${
        task.done ? "border-slate-100 bg-slate-50/40 opacity-75" : "border-slate-150 hover:border-slate-300"
      }`}
    >
      {/* Task importance banner color tag on the left */}
      {!task.done && (
        <div className={`absolute top-0 left-0 bottom-0 w-1.5 rounded-l-2xl ${
          Number(task.importance) >= 5 
            ? "bg-rose-500" 
            : Number(task.importance) >= 4 
            ? "bg-amber-500" 
            : "bg-emerald-500"
        }`} />
      )}

      {/* Top Section */}
      <div className="flex items-start justify-between gap-4 mb-4 pl-1">
        <div className="flex items-start gap-4.5">
          {/* Main Status Check Circle */}
          <button
            onClick={() => onToggleComplete(task.id)}
            className={`mt-1 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              task.done
                ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                : "border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50"
            }`}
            title={task.done ? "Mark as open" : "Mark as done"}
          >
            {task.done && <Check size={14} className="stroke-[3]" />}
          </button>

          <div className="space-y-1.5">
            <h4 className={`font-display font-semibold text-[16px] leading-snug tracking-tight transition-all ${
              task.done ? "text-slate-400 line-through" : "text-slate-800"
            }`}>
              {task.title}
            </h4>

            {/* Deadline and stats row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-100">
                <Calendar size={13} className="text-slate-400" />
                Due: {formatDeadline(task.deadline)}
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px] bg-emerald-50/50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100/50 font-semibold">
                <Zap size={11} className="text-emerald-500" />
                Priority Score: {score}
              </span>
              <span className="bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-100">
                Importance: {task.importance}/5
              </span>
              <span className="bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-100">
                Effort: {task.effort === "3" ? "Deep Work (5h+)" : task.effort === "2" ? "Moderate (3-5h)" : "Quick (1-2h)"}
              </span>
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <span className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold tracking-wider uppercase rounded-full border shrink-0 ${statusColors.bg} ${statusColors.text}`}>
          {statusColors.icon}
          {status.label}
        </span>
      </div>

      {/* Task Notes */}
      {task.notes && (
        <p className="text-xs text-slate-600 bg-slate-50/50 border border-slate-100/80 rounded-xl p-3 mb-4 leading-relaxed pl-4 font-sans border-l-4 border-l-slate-300">
          {task.notes}
        </p>
      )}

      {/* Structured / Beautiful AI Rescue Plan Panel */}
      <div className={`rounded-xl border p-4 sm:p-5 transition-all duration-300 ${
        task.aiPlan 
          ? "bg-purple-50/40 border-purple-100 text-purple-950" 
          : "bg-emerald-50/30 border-emerald-100/60 text-emerald-950"
      }`}>
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100/60">
          <div className="flex items-center gap-2">
            {task.aiPlan ? (
              <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Sparkles size={13} className="animate-pulse" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck size={13} />
              </div>
            )}
            <span className="font-display font-bold text-xs tracking-wide uppercase">
              {task.aiPlan ? "Gemini Proactive Rescue Blueprint" : "Suggested Action Checklist"}
            </span>
          </div>

          <span className={`font-mono text-[9px] px-2 py-0.5 rounded border font-semibold uppercase tracking-wider ${
            task.aiPlan 
              ? "text-purple-600 bg-purple-50 border-purple-100" 
              : "text-emerald-600 bg-emerald-50 border-emerald-100"
          }`}>
            {task.aiPlan ? "AI Model Plan" : "System Template"}
          </span>
        </div>

        {parsed.isParsed ? (
          <div className="space-y-4">
            {/* Priority Section if present */}
            {parsed.priority && (
              <div className="text-xs pl-2 border-l-2 border-amber-400">
                <span className="font-bold text-amber-800 text-[10px] uppercase tracking-wider block mb-0.5">Target Diagnosis</span>
                <p className="text-slate-600 font-sans italic leading-relaxed">{parsed.priority}</p>
              </div>
            )}

            {/* Steps Timeline Checklist */}
            <div className="space-y-2.5 mt-1">
              <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block">Action Milestones</span>
              <div className="grid gap-2">
                {parsed.steps.map((step, idx) => {
                  const isChecked = checkedSteps[idx] || false;
                  return (
                    <div 
                      key={idx}
                      onClick={() => !task.done && toggleStep(idx)}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                        task.done
                          ? "bg-slate-50 border-slate-100 text-slate-400 pointer-events-none"
                          : isChecked
                          ? "bg-emerald-50/50 border-emerald-200/50 text-slate-500 shadow-2xs"
                          : task.aiPlan
                          ? "bg-white hover:bg-purple-50/20 border-slate-100 hover:border-purple-100 text-slate-700"
                          : "bg-white hover:bg-emerald-50/10 border-slate-100 hover:border-emerald-100/70 text-slate-700"
                      }`}
                    >
                      <button
                        type="button"
                        disabled={task.done}
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                          isChecked
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300 hover:border-emerald-500"
                        }`}
                      >
                        {isChecked && <Check size={10} className="stroke-[3]" />}
                      </button>
                      <div className="text-[12px] leading-relaxed">
                        <span className="font-bold text-[10px] text-slate-400 mr-1.5 font-mono uppercase">
                          Step {idx + 1}
                        </span>
                        <span className={isChecked ? "line-through text-slate-400" : ""}>{step}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Warning Callout */}
            {parsed.warning && (
              <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg text-amber-900 text-xs flex items-start gap-2.5 mt-2">
                <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[10px] text-amber-800 uppercase tracking-wide block mb-0.5">Rescue Risk Warning</span>
                  <p className="text-slate-600 font-sans leading-relaxed">{parsed.warning}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Fallback raw display if parsing was impossible */
          <p className="whitespace-pre-line leading-relaxed font-sans text-xs text-slate-600 pl-1">
            {rawPlanText}
          </p>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-slate-100 opacity-90 group-hover:opacity-100 transition-all">
        {!task.done && (
          <button
            onClick={() => onGenerateAIPlan(task.id)}
            disabled={isGenerating}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              isGenerating
                ? "bg-purple-50 border border-purple-100 text-purple-400 cursor-not-allowed"
                : "bg-purple-50 hover:bg-purple-100 border border-purple-150 text-purple-700 active:scale-95"
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span>Formulating Steps...</span>
              </>
            ) : (
              <>
                <Sparkles size={13} className="text-purple-500" />
                <span>{task.aiPlan ? "Re-plan with Gemini" : "Generate AI Plan"}</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={() => onDelete(task.id)}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
          title="Delete commitment"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </motion.article>
  );
}

