import { Task } from "../types";
import { getRisk, getPriorityScore, formatDeadline } from "../utils";
import { ShieldCheck, AlertOctagon, AlertTriangle, Sparkles, CheckSquare } from "lucide-react";

interface RiskIntelProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
}

export default function RiskIntel({ tasks, onToggleComplete }: RiskIntelProps) {
  const openTasks = tasks.filter((task) => !task.done);

  const riskData = openTasks.map((task) => ({
    task,
    risk: getRisk(task),
    score: getPriorityScore(task)
  })).sort((a, b) => b.score - a.score);

  const highRiskList = riskData.filter((item) => item.risk.level === "high");
  const mediumRiskList = riskData.filter((item) => item.risk.level === "medium");
  const safeRiskList = riskData.filter((item) => item.risk.level === "safe");

  // Get the single highest priority task as the core rescue focus
  const topTaskItem = riskData[0];

  return (
    <div className="space-y-6">
      {/* 3-Tile Risk Counter Row with enhanced layout & border accents */}
      <div className="grid grid-cols-3 gap-4">
        {/* High Risk Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-4.5 flex items-center justify-between shadow-xs relative overflow-hidden group hover:border-rose-200 transition-all">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-500" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">High Risk</span>
            <span className="block text-2xl font-bold font-display text-rose-600 mt-1">{highRiskList.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <AlertOctagon size={18} />
          </div>
        </div>

        {/* Medium Risk Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-4.5 flex items-center justify-between shadow-xs relative overflow-hidden group hover:border-amber-200 transition-all">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Medium Risk</span>
            <span className="block text-2xl font-bold font-display text-amber-600 mt-1">{mediumRiskList.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <AlertTriangle size={18} />
          </div>
        </div>

        {/* Safe Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-4.5 flex items-center justify-between shadow-xs relative overflow-hidden group hover:border-emerald-200 transition-all">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Safe</span>
            <span className="block text-2xl font-bold font-display text-emerald-600 mt-1">{safeRiskList.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <ShieldCheck size={18} />
          </div>
        </div>
      </div>

      {/* Top Priority Rescue Target */}
      {topTaskItem ? (
        <div className={`p-6 rounded-2xl border relative overflow-hidden shadow-sm transition-all duration-300 ${
          topTaskItem.risk.level === "high"
            ? "bg-rose-50/40 border-rose-150 text-rose-950"
            : topTaskItem.risk.level === "medium"
            ? "bg-amber-50/40 border-amber-150 text-amber-950"
            : "bg-emerald-50/30 border-emerald-150 text-emerald-950"
        }`}>
          {/* Subtle colored mesh glow */}
          <div className={`absolute -right-16 -top-16 w-32 h-32 rounded-full blur-2xl opacity-15 pointer-events-none ${
            topTaskItem.risk.level === "high" ? "bg-rose-500" : topTaskItem.risk.level === "medium" ? "bg-amber-500" : "bg-emerald-500"
          }`} />

          <div className="flex items-center gap-2 mb-3">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              topTaskItem.risk.level === "high" ? "bg-rose-100 text-rose-700" : topTaskItem.risk.level === "medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
            }`}>
              <Sparkles size={13} className="animate-pulse" />
            </div>
            <h4 className="font-display font-bold text-xs uppercase tracking-wider">Urgent Rescue Diagnosis</h4>
          </div>

          <p className="text-base font-bold text-slate-800 mb-3 pl-0.5 leading-snug">
            {topTaskItem.task.title}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/80 border border-slate-100/50 rounded-xl p-4 text-xs">
            <div className="space-y-1">
              <strong className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">Primary Risk Analysis</strong>
              <p className="text-slate-600 font-sans leading-relaxed">{topTaskItem.risk.reason}</p>
            </div>
            <div className="space-y-1">
              <strong className="text-[10px] uppercase tracking-wider text-emerald-700 block font-bold">Recommended Mitigation</strong>
              <p className="text-slate-600 font-sans leading-relaxed">{topTaskItem.risk.suggestion}</p>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <span className="text-[10px] font-mono font-semibold text-slate-400">
              Score rating: <span className="font-bold text-slate-700">{topTaskItem.score} points</span>
            </span>
            <button
              onClick={() => onToggleComplete(topTaskItem.task.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-white border border-slate-150 shadow-xs hover:shadow-md transition-all active:scale-[0.97] cursor-pointer ${
                topTaskItem.risk.level === "high" ? "text-rose-700 hover:bg-rose-50/30" : topTaskItem.risk.level === "medium" ? "text-amber-700 hover:bg-amber-50/30" : "text-emerald-700 hover:bg-emerald-50/30"
              }`}
            >
              <CheckSquare size={13} />
              Mark Completed
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/40 text-center text-slate-500 text-xs">
          <ShieldCheck size={32} className="mx-auto text-emerald-500/80 mb-3 animate-bounce" />
          <p className="font-display font-semibold text-slate-700 text-sm">No critical risk metrics detected</p>
          <p className="text-slate-400 mt-1 max-w-sm mx-auto">Excellent! Your commitment schedule is perfectly manageable. Create a new task to run the proactive advisor.</p>
        </div>
      )}

      {/* Risk Analysis Table */}
      {riskData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-3.5 mb-4">
            <h4 className="font-display font-semibold text-slate-800 text-sm">Deadline Risk Breakdown</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Urgency diagnostics based on effort hours vs due time</p>
          </div>
          
          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {riskData.map(({ task, risk, score }) => (
              <div
                key={task.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50/80 transition-colors duration-200"
              >
                <div className="min-w-0 flex-1">
                  <h5 className="text-[13px] font-semibold text-slate-800 truncate leading-snug">{task.title}</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-400">Due {formatDeadline(task.deadline)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[10px] text-slate-400 font-mono">Score {score}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono italic hidden lg:inline max-w-[200px] truncate">
                    {risk.reason}
                  </span>
                  
                  {/* Visual risk bar index */}
                  <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden hidden sm:block">
                    <div 
                      className={`h-1.5 rounded-full ${
                        risk.level === "high" 
                          ? "bg-rose-500" 
                          : risk.level === "medium" 
                          ? "bg-amber-400" 
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(Math.max((score / 150) * 100, 15), 100)}%` }}
                    />
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    risk.level === "high"
                      ? "bg-rose-100/70 text-rose-700"
                      : risk.level === "medium"
                      ? "bg-amber-100/70 text-amber-700"
                      : "bg-emerald-100/70 text-emerald-700"
                  }`}>
                    {risk.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
