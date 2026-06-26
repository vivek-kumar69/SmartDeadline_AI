import { useState, useEffect } from "react";
import { Task } from "./types";
import { getPriorityScore, buildPlan, parseDailySchedule } from "./utils";
import TaskForm from "./components/TaskForm";
import TaskCard from "./components/TaskCard";
import RiskIntel from "./components/RiskIntel";
import StatsGrid from "./components/StatsGrid";
import { 
  Sparkles, 
  RotateCw, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  ShieldCheck, 
  Briefcase,
  ExternalLink,
  BookOpen,
  PlusCircle,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem("smartdeadline.tasks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dailyPlan, setDailyPlan] = useState<string>(() => {
    return localStorage.getItem("smartdeadline.dailyPlan") || "";
  });

  const [activeFilter, setActiveFilter] = useState<"all" | "open" | "done">("all");
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [generatingAIPlanId, setGeneratingAIPlanId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("smartdeadline.tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("smartdeadline.dailyPlan", dailyPlan);
  }, [dailyPlan]);

  // Seed tasks
  const handleSeedTasks = () => {
    const now = new Date();
    const createDeadline = (hours: number) => {
      const d = new Date(now.getTime() + hours * 60 * 60 * 1000);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hoursStr = String(d.getHours()).padStart(2, "0");
      const minutesStr = String(d.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hoursStr}:${minutesStr}`;
    };

    const seed: Task[] = [
      {
        id: "seed-1",
        title: "Prepare hackathon project description",
        deadline: createDeadline(18),
        importance: "5",
        effort: "2",
        notes: "Include problem statement, solution overview, key features, tech stack, and Google technologies used.",
        done: false,
        createdAt: new Date().toISOString()
      },
      {
        id: "seed-2",
        title: "Finish working prototype",
        deadline: createDeadline(42),
        importance: "5",
        effort: "3",
        notes: "Build the dashboard, task planner, and AI recommendation flow.",
        done: false,
        createdAt: new Date().toISOString()
      },
      {
        id: "seed-3",
        title: "Record final demo walkthrough",
        deadline: createDeadline(70),
        importance: "4",
        effort: "2",
        notes: "Show task creation, prioritization, and action planning.",
        done: false,
        createdAt: new Date().toISOString()
      }
    ];

    setTasks(seed);
    setErrorMessage(null);
  };

  // Add Task
  const handleAddTask = (newTask: Omit<Task, "id" | "done" | "createdAt">) => {
    const taskWithMeta: Task = {
      ...newTask,
      id: crypto.randomUUID(),
      done: false,
      createdAt: new Date().toISOString()
    };
    setTasks((prev) => [...prev, taskWithMeta]);
  };

  // Toggle Completion
  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Generate task rescue plan using Gemini API
  const handleGenerateAIPlan = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    setGeneratingAIPlanId(id);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate AI plan.");
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, aiPlan: data.plan } : t))
      );
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "An error occurred while calling the Gemini API.");
    } finally {
      setGeneratingAIPlanId(null);
    }
  };

  // Generate daily schedule using Gemini API
  const handleGenerateDailyPlan = async () => {
    const openTasks = tasks.filter((t) => !t.done);
    if (openTasks.length === 0) {
      setErrorMessage("Please add at least one open task before generating a daily schedule.");
      return;
    }

    setGeneratingPlan(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/daily-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: openTasks })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate daily schedule.");
      }

      setDailyPlan(data.plan);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Failed to contact the Gemini API scheduling engine.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  // Filter & Sort Tasks
  const filteredTasks = tasks
    .filter((task) => {
      if (activeFilter === "open") return !task.done;
      if (activeFilter === "done") return task.done;
      return true;
    })
    // Sort by priority score descending
    .sort((a, b) => getPriorityScore(b) - getPriorityScore(a));

  const topOpenTask = tasks
    .filter((t) => !t.done)
    .sort((a, b) => getPriorityScore(b) - getPriorityScore(a))[0];

  return (
    <div className="min-h-screen bg-slate-50/50 dot-grid text-slate-800 selection:bg-emerald-100 selection:text-emerald-900 pb-16">
      
      {/* Top Banner & Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-150 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/10 text-white hover:scale-105 transition-transform duration-200">
              <Sparkles size={20} className="fill-emerald-100/15 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-[17px] tracking-tight text-slate-900 leading-none">SmartDeadline AI</h1>
                <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Active
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">Proactive Productivity Companion</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSeedTasks}
              className="px-3.5 py-2 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100/75 text-emerald-700 rounded-lg transition-all active:scale-[0.98] border border-emerald-100/80 cursor-pointer"
            >
              Load Demo Tasks
            </button>
            <a 
              href="#addTaskSection"
              className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all active:scale-[0.98] shadow-sm hidden sm:inline-flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle size={14} />
              New Task
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Dynamic Title Hero section with sleeker gradient mesh overlay */}
        <div className="bg-emerald-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm border border-emerald-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-600/40 via-emerald-950 to-slate-950 opacity-95 z-0" />
          <div className="relative z-10 max-w-3xl space-y-2.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 uppercase tracking-widest">
              Last-Minute Life Saver
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl leading-snug tracking-tight">
              Plan the next best action before deadlines are missed.
            </h2>
            <p className="text-emerald-100/90 text-xs sm:text-[13px] max-w-2xl leading-relaxed">
              SmartDeadline AI goes beyond passive notification alarms. By analyzing task complexity and exact windows, it leverages Gemini models to formulate targeted, step-by-step rescue plans and realistic hour-by-hour timelines.
            </p>
          </div>
        </div>

        {/* Global Stats bar */}
        <StatsGrid tasks={tasks} />

        {/* Error Notification Toast if any */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button 
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-700 font-bold px-1.5 py-0.5 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Double Panel Workplace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Planner Inputs & Daily schedules) */}
          <section className="lg:col-span-4 space-y-6">
            
            {/* Task Form */}
            <TaskForm onAddTask={handleAddTask} />

            {/* Today's Focus Widget */}
            <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500" />
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3 pl-1">
                <Clock size={12} className="text-emerald-600" />
                <span>Today's Core Priority</span>
              </div>
              {topOpenTask ? (
                <div className="space-y-3 pl-1">
                  <h4 className="font-display font-bold text-[14px] text-slate-800 leading-snug">{topOpenTask.title}</h4>
                  <div className="text-[11px] text-slate-500 bg-slate-50/50 rounded-xl p-3 border border-slate-100 leading-relaxed font-sans italic">
                    "{buildPlan(topOpenTask).slice(0, 160)}..."
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic pl-1">No active commitments. Add or activate a task above to anchor your day.</p>
              )}
            </div>

            {/* AI Scheduler Module */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-5.5 border border-slate-800 shadow-lg relative overflow-hidden">
              <div className="absolute -right-20 -bottom-20 w-40 h-40 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
              <div className="flex items-center justify-between mb-4.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Agentic Scheduler</span>
                    <h3 className="font-display font-bold text-sm text-slate-100">AI Daily Planner</h3>
                  </div>
                </div>
                <button
                  onClick={handleGenerateDailyPlan}
                  disabled={generatingPlan}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold rounded-lg transition-all active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
                >
                  {generatingPlan ? (
                    <>
                      <RotateCw size={11} className="animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={11} />
                      <span>Generate Plan</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-sans text-slate-300 min-h-[160px] max-h-[380px] overflow-y-auto">
                {dailyPlan ? (
                  (() => {
                    const parsedSchedule = parseDailySchedule(dailyPlan);
                    if (parsedSchedule.length > 0) {
                      return (
                        <div className="space-y-4 pl-3.5 relative border-l border-slate-800/80">
                          {parsedSchedule.map((item, idx) => (
                            <div key={idx} className="relative group/time">
                              {/* Glowing timeline node */}
                              <div className="absolute -left-[18.5px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10 group-hover/time:bg-emerald-400 group-hover/time:ring-emerald-400/20 transition-all duration-200" />
                              <div className="space-y-0.5">
                                <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                                  {item.time}
                                </span>
                                <p className="text-slate-200 text-xs leading-relaxed group-hover/time:text-white transition-colors">
                                  {item.activity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <div className="whitespace-pre-line leading-relaxed text-slate-300 pl-1">
                        {dailyPlan}
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-10">
                    <Sparkles size={24} className="text-slate-600 mx-auto mb-2 animate-pulse" />
                    <span className="text-slate-500 italic block leading-relaxed max-w-xs mx-auto">
                      Add commitments with deadlines, then click 'Generate Plan' to synthesize a real-time hour-by-hour rescue timeline.
                    </span>
                  </div>
                )}
              </div>
            </div>

          </section>

          {/* Right Column (Risks & Prioritized queue) */}
          <section className="lg:col-span-8 space-y-8">
            
            {/* Risk Intel Section */}
            <RiskIntel tasks={tasks} onToggleComplete={handleToggleComplete} />

            {/* Main Task List Board */}
            <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-slate-800 text-sm">Prioritized Work Queue</h3>
                    <span className="text-[10px] text-slate-400 block">Autonomously ranked by urgency & dynamic scoring</span>
                  </div>
                </div>

                {/* Filter group with clean count badges */}
                <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-150 self-start sm:self-auto text-xs font-semibold">
                  <button
                    onClick={() => setActiveFilter("all")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeFilter === "all" ? "bg-white text-slate-800 shadow-xs border border-slate-100" : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    <span>All</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeFilter === "all" ? "bg-slate-100 text-slate-700" : "bg-slate-200/50 text-slate-400"}`}>
                      {tasks.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveFilter("open")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeFilter === "open" ? "bg-white text-slate-800 shadow-xs border border-slate-100" : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    <span>Open</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeFilter === "open" ? "bg-emerald-50 text-emerald-700" : "bg-slate-200/50 text-slate-400"}`}>
                      {tasks.filter((t) => !t.done).length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveFilter("done")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeFilter === "done" ? "bg-white text-slate-800 shadow-xs border border-slate-100" : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    <span>Done</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeFilter === "done" ? "bg-slate-100 text-slate-600" : "bg-slate-200/50 text-slate-400"}`}>
                      {tasks.filter((t) => t.done).length}
                    </span>
                  </button>
                </div>
              </div>

              {/* Task queue cards list with AnimatePresence */}
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDeleteTask}
                        onGenerateAIPlan={handleGenerateAIPlan}
                        generatingAIPlanId={generatingAIPlanId}
                      />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-14 border border-dashed border-slate-200 rounded-2xl bg-slate-50/40"
                    >
                      <CheckCircle size={32} className="text-slate-300 mx-auto mb-2" />
                      <p className="font-display font-semibold text-slate-600 text-sm">No commitments matched your filter</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                        {activeFilter === "all" 
                          ? "Click 'Load Demo Tasks' or add a custom task above to begin." 
                          : "Try selecting a different filter above to view completed items."}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </section>

        </div>

        {/* Hackathon Brief Segment */}
        <section className="bg-white border border-slate-150 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60">
              <Briefcase size={16} />
            </div>
            <div>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Submission Summary</span>
              <h3 className="font-display font-semibold text-slate-800 text-base">Why SmartDeadline AI Matters</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
              <span className="font-extrabold text-[10px] text-emerald-700 tracking-wider uppercase block">Problem Statement</span>
              <p className="text-slate-600 leading-relaxed">
                Traditional planners rely on passive alert sounds that are simple to ignore and fail to provide actionable paths. Users are left scrambling when the deadline is close.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
              <span className="font-extrabold text-[10px] text-emerald-700 tracking-wider uppercase block">Solution Overview</span>
              <p className="text-slate-600 leading-relaxed">
                SmartDeadline AI implements a priority score algorithm combining deadline distance with task details. It flags risks and maps exact steps so users know where to start.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
              <span className="font-extrabold text-[10px] text-emerald-700 tracking-wider uppercase block">Key Features</span>
              <p className="text-slate-600 leading-relaxed">
                AI daily schedule synthesizer, task-level rescue blueprints, live risk tracking widgets, dynamic priority score values, queue filtering, and full local persistence.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
              <span className="font-extrabold text-[10px] text-emerald-700 tracking-wider uppercase block">Google Technologies</span>
              <p className="text-slate-600 leading-relaxed">
                Google Gemini API (<code className="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded text-[10px]">gemini-3.5-flash</code>) powers the task planning and schedule generation backend via the official <code className="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded text-[10px]">@google/genai</code> SDK.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
