import { Task } from "../types";
import { hoursUntil } from "../utils";
import { ListTodo, CheckCircle, Flame, PieChart, Sparkles } from "lucide-react";

interface StatsGridProps {
  tasks: Task[];
}

export default function StatsGrid({ tasks }: StatsGridProps) {
  const total = tasks.length;
  const done = tasks.filter((task) => task.done).length;
  const active = total - done;
  const openTasks = tasks.filter((task) => !task.done);

  // Uncompleted tasks with deadline in <= 24 hours
  const urgentCount = openTasks.filter((task) => {
    const hrs = hoursUntil(task.deadline);
    return hrs > 0 && hrs <= 24;
  }).length;

  // Completion score (percentage)
  const focusScore = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Total Tasks */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-start gap-4 hover:border-slate-200 transition-all">
        <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-100">
          <ListTodo size={20} />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 block">Total Tasks</span>
          <span className="text-2xl font-bold font-display text-slate-800 block">{total}</span>
          <span className="text-[10px] text-slate-500 font-medium block">
            {active} Active · {done} Done
          </span>
        </div>
      </div>

      {/* Urgent Needs Action */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-start gap-4 hover:border-slate-200 transition-all">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
          urgentCount > 0 
            ? "bg-rose-50 border-rose-100 text-rose-600 animate-pulse shadow-sm shadow-rose-100/50" 
            : "bg-slate-50 border-slate-100 text-slate-400"
        }`}>
          <Flame size={20} />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 block">Due &lt;24 hrs</span>
          <span className={`text-2xl font-bold font-display block ${urgentCount > 0 ? "text-rose-600 animate-pulse" : "text-slate-800"}`}>
            {urgentCount}
          </span>
          <span className={`text-[10px] font-medium block ${urgentCount > 0 ? "text-rose-500" : "text-slate-500"}`}>
            {urgentCount > 0 ? "Requires instant focus" : "No urgent emergencies"}
          </span>
        </div>
      </div>

      {/* Completed */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-start gap-4 hover:border-slate-200 transition-all">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
          <CheckCircle size={20} />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 block">Completed</span>
          <span className="text-2xl font-bold font-display text-slate-800 block">{done}</span>
          <span className="text-[10px] text-emerald-600 font-semibold block flex items-center gap-1">
            <Sparkles size={10} />
            {total > 0 && done === total ? "All clear! Brilliant" : `${done}/${total} resolved`}
          </span>
        </div>
      </div>

      {/* Focus Score */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-start gap-4 hover:border-slate-200 transition-all">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <PieChart size={20} />
        </div>
        <div className="space-y-1.5 w-full">
          <span className="text-xs font-semibold text-slate-400 block">Focus Score</span>
          <span className="text-2xl font-bold font-display text-slate-800 block">{focusScore}%</span>
          
          {/* Visual Progress Bar inside Focus Score card */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-1.5 rounded-full transition-all duration-700 ${
                focusScore >= 80 
                  ? "bg-emerald-500" 
                  : focusScore >= 50 
                  ? "bg-blue-500" 
                  : focusScore >= 20 
                  ? "bg-amber-500" 
                  : "bg-slate-300"
              }`}
              style={{ width: `${focusScore}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

