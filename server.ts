import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add JSON parsing middleware
  app.use(express.json());

  // Helper function for India Date Time
  function getCurrentIndiaDateTime() {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Kolkata"
    }).format(new Date());
  }

  // API Route: Task Plan
  app.post("/api/plan", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "Missing GEMINI_API_KEY. Please configure it in your Settings > Secrets panel."
        });
      }

      const { task } = req.body;
      if (!task) {
        return res.status(400).json({ error: "Task data is required." });
      }

      // Initialize Gemini Client
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const currentDate = getCurrentIndiaDateTime();
      const prompt = [
        "Create a deadline rescue plan for this task.",
        `Current date and time: ${currentDate}`,
        `Title: ${task.title || "Untitled task"}`,
        `Deadline: ${task.deadline || "Not provided"}`,
        `Importance: ${task.importance || "3"} out of 5`,
        `Effort: ${task.effort || "2"} out of 3`,
        `Notes: ${task.notes || "No notes"}`,
        "",
        "Return only plain text without Markdown symbols.",
        "Use this exact format:",
        "Priority: one sentence explaining why this matters now.",
        "Step 1: one concrete action.",
        "Step 2: one concrete action.",
        "Step 3: one concrete action.",
        "Warning: one short warning only if the task is risky; otherwise write Warning: No major risk."
      ].join("\n");

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are SmartDeadline AI, a practical productivity companion. Give clear, short, action-oriented plans for students and beginner builders. Do not use Markdown styling.",
          temperature: 0.4,
        }
      });

      res.json({
        plan: response.text || "Start with the smallest useful action, then review before the deadline.",
        model: "gemini-3.5-flash"
      });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI plan." });
    }
  });

  // API Route: Daily Planner
  app.post("/api/daily-plan", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "Missing GEMINI_API_KEY. Please configure it in your Settings > Secrets panel."
        });
      }

      const { tasks } = req.body;
      if (!tasks || !Array.isArray(tasks)) {
        return res.status(400).json({ error: "An array of tasks is required." });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const currentDate = getCurrentIndiaDateTime();
      const openTasksText = tasks
        .filter((task: any) => !task.done)
        .map((task: any, index: number) => {
          return [
            `Task ${index + 1}: ${task.title || "Untitled task"}`,
            `Deadline: ${task.deadline || "Not provided"}`,
            `Importance: ${task.importance || "3"} out of 5`,
            `Effort: ${task.effort || "2"} out of 3`,
            `Notes: ${task.notes || "No notes"}`
          ].join("\n");
        })
        .join("\n\n");

      const prompt = [
        "Create a practical daily schedule for a user who wants to finish tasks before deadlines.",
        `Current date and time: ${currentDate}`,
        "",
        openTasksText || "There are no open tasks.",
        "",
        "Return only plain text without Markdown symbols.",
        "Use this exact format:",
        "Today Priority: one sentence choosing the most important focus.",
        "Schedule:",
        "HH:MM AM/PM - HH:MM AM/PM: specific work block.",
        "HH:MM AM/PM - HH:MM AM/PM: specific work block.",
        "HH:MM AM/PM - HH:MM AM/PM: specific work block.",
        "Recovery Buffer: one short backup plan if the user falls behind.",
        "Do not schedule work in the past. Keep the plan realistic for today."
      ].join("\n");

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are SmartDeadline AI, a practical productivity companion. Give clear, short, action-oriented plans for students and beginner builders. Do not use Markdown styling.",
          temperature: 0.4,
        }
      });

      res.json({
        plan: response.text || "Create a schedule based on your open tasks, dedicating blocks of time to deep work.",
        model: "gemini-3.5-flash"
      });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate daily plan." });
    }
  });

  // Vite middleware for development, static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
