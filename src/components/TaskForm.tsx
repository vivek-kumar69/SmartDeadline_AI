import React, { useState } from "react";
import { Task } from "../types";
import { Plus, Calendar, AlertTriangle, Hammer, FileText, Sparkles } from "lucide-react";

interface TaskFormProps {
  onAddTask: (task: Omit<Task, "id" | "done" | "createdAt">) => void;
}

export default function TaskForm({ onAddTask }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [importance, setImportance] = useState("3");
  const [effort, setEffort] = useState("2");
  const [notes, setNotes] = useState("");

  const presets = [
    {
      label: "📝 Submit Essay",
      title: "Write and submit draft essay",
      importance: "4",
      effort: "2",
      offsetHours: 18,
      notes: "Draft introduction, review sources, compile bibliography, and double-check academic citations."
    },
    {
      label: "🚀 Deliver Code",
      title: "Deploy working prototype and demo",
      importance: "5",
      effort: "3",
      offsetHours: 36,
      notes: "Finalize main dashboard view, test key interactive states, and record walkthrough video walkthrough."
    },
    {
      label: "🛠️ UI Polish Pass",
      title: "Polish typography and spacing details",
      importance: "3",
      effort: "1",
      offsetHours: 6,
      notes: "Fix margin padding, align input borders, apply custom color combinations, and optimize responsiveness."
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    const d = new Date(Date.now() + preset.offsetHours * 60 * 60 * 1000);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hoursStr = String(d.getHours()).padStart(2, "0");
    const minutesStr = String(d.getMinutes()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}T${hoursStr}:${minutesStr}`;

    setTitle(preset.title);
    setImportance(preset.importance);
    setEffort(preset.effort);
    setDeadline(dateStr);
    setNotes(preset.notes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;

    onAddTask({
      title: title.trim(),
      deadline,
      importance,
      effort,
      notes: notes.trim()
    });

    // Reset fields
    setTitle("");
    setDeadline("");
    setImportance("3");
    setEffort("2");
    setNotes("");
  };

  return (
    <div id="addTaskSection" className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
          <Plus size={20} />
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Plan Ahead</span>
          <h3 className="font-display font-semibold text-slate-800 text-lg">Create Commitment</h3>
        </div>
      </div>

      {/* Preset Buttons Container */}
      <div className="mb-5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5 flex items-center gap-1">
          <Sparkles size={11} className="text-emerald-500" />
          Quick Preset Suggestions
        </span>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 active:bg-slate-200/50 border border-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-all active:scale-95 cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="task-title" className="block text-xs font-semibold text-slate-600 mb-1.5">
            Task Name
          </label>
          <div className="relative">
            <input
              id="task-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Write project report, submit calculus code"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400 text-slate-800"
            />
          </div>
        </div>

        <div>
          <label htmlFor="task-deadline" className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Calendar size={14} className="text-slate-400" />
            Deadline Time
          </label>
          <input
            id="task-deadline"
            type="datetime-local"
            required
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-importance" className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-slate-400" />
              Importance
            </label>
            <select
              id="task-importance"
              value={importance}
              onChange={(e) => setImportance(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none bg-white text-slate-800 cursor-pointer"
            >
              <option value="5">🔥 Critical (5/5)</option>
              <option value="4">⭐ High (4/5)</option>
              <option value="3">⚡ Medium (3/5)</option>
              <option value="2">💤 Low (2/5)</option>
              <option value="1">🌱 Minimal (1/5)</option>
            </select>
          </div>

          <div>
            <label htmlFor="task-effort" className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Hammer size={14} className="text-slate-400" />
              Complexity
            </label>
            <select
              id="task-effort"
              value={effort}
              onChange={(e) => setEffort(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none bg-white text-slate-800 cursor-pointer"
            >
              <option value="1">⚡ Quick (1-2 hrs)</option>
              <option value="2">🧩 Moderate (3-5 hrs)</option>
              <option value="3">🧗 Deep Work (5+ hrs)</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="task-notes" className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <FileText size={14} className="text-slate-400" />
            Add Details & Notes
          </label>
          <textarea
            id="task-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Help Gemini tailor the checklist: add links, specifications, or blockers..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400 text-slate-800 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus size={16} />
          Create Commitment
        </button>
      </form>
    </div>
  );
}
