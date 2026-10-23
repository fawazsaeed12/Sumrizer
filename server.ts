import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";

app.use(express.json({ limit: "10mb" }));

const API_KEY = process.env.GEMINI_API_KEY || "";

const ai = new GoogleGenAI({
  apiKey: API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Robust JSON extractor that handles markdown fences and partial text
function extractJSON(rawText: string): any {
  if (!rawText) return null;
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();

  // Find outermost curly braces
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // If JSON parsing fails due to unescaped control chars, try sanitizing
    const sanitized = cleaned
      .replace(/[\u0000-\u001F]+/g, (match) => (match === "\n" || match === "\r" || match === "\t" ? match : ""));
    return JSON.parse(sanitized);
  }
}

// Helper to run a model attempt with a timeout
function callModelWithTimeout(modelName: string, contents: any, config?: any, timeoutMs = 15000): Promise<string> {
  return Promise.race([
    ai.models.generateContent({
      model: modelName,
      contents,
      config,
    }).then((res) => {
      const text = res.text;
      if (!text || !text.trim()) {
        throw new Error(`Empty response from ${modelName}`);
      }
      return text;
    }),
    new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms on ${modelName}`)), timeoutMs)
    ),
  ]);
}

// Multi-tiered model executor ensuring no infinite hanging
async function generateWithFallback(options: {
  model?: string;
  contents: any;
  config?: any;
}) {
  const isGemmaRequested = options.model === "gemma-4" || options.model?.includes("gemma");

  // Determine priority order
  const modelQueue = isGemmaRequested
    ? ["gemma-4-26b-a4b-it", "gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"]
    : ["gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash", "gemma-4-26b-a4b-it"];

  let lastError: any = null;

  for (const modelCandidate of modelQueue) {
    try {
      console.log(`[Sumrizer] Attempting generation with: ${modelCandidate}`);
      
      const candidateConfig: any = { ...options.config };
      // Gemma does not use responseSchema
      if (modelCandidate.includes("gemma")) {
        delete candidateConfig.responseSchema;
        delete candidateConfig.responseMimeType;
      }

      const text = await callModelWithTimeout(modelCandidate, options.contents, candidateConfig, 14000);
      console.log(`[Sumrizer] Success with model: ${modelCandidate}`);
      return text;
    } catch (err: any) {
      console.warn(`[Sumrizer] Model ${modelCandidate} failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("All AI models failed to respond. Please try again.");
}

// 1. POST /api/summarize - Transforms raw lecture key points into structured deep dive
app.post("/api/summarize", async (req, res) => {
  try {
    const { subject, topic, notes, detailLevel = "comprehensive", model = "flash" } = req.body;

    if (!notes || typeof notes !== "string" || !notes.trim()) {
      return res.status(400).json({ error: "Lecture notes/key points are required." });
    }

    const systemInstruction = `You are Sumrizer, an elite academic learning engine powered by Google's Gemma and Gemini AI architectures.
Your mission is to take raw, messy, or bulleted lecture key points that students type or jot down during lectures and transform them into:
1. An executive summary that gives a clear big-picture understanding.
2. A high-clarity structured breakdown of every single key point and concept, explaining definitions, underlying mechanisms, intuitive analogies, and practical applications.
3. High-yield exam and test questions with model answers.
4. Recommended important topics (prerequisites, advanced next topics, cross-disciplinary connections) with why each matters.
5. High-impact recommended questions that students should ask their professor, TA, or investigate during study sessions.

Respond strictly with valid JSON. Do not write introductory prose or trailing commentary.`;

    const prompt = `Course / Subject: ${subject || "General Academic"}
Lecture Topic: ${topic || "Lecture Key Points"}
Detail Level: ${detailLevel}

RAW LECTURE KEY POINTS:
"""
${notes}
"""

Return a valid JSON object conforming exactly to this structure:
{
  "title": "Clear engaging lecture title",
  "subject": "${subject || "Course Subject"}",
  "topic": "${topic || "Lecture Topic"}",
  "executiveSummary": "2-3 comprehensive academic paragraphs explaining the big picture",
  "keyTakeaways": ["Core takeaway 1", "Core takeaway 2", "Core takeaway 3"],
  "structuredBreakdown": [
    {
      "pointTitle": "Short title of key point",
      "conceptName": "Academic concept name",
      "detailedExplanation": "Thorough mechanics and theoretical explanation",
      "intuitiveAnalogy": "Relatable intuitive mental model",
      "realWorldApplication": "Concrete real-world or industry example",
      "keyFormulasOrCode": "Formula or code snippet if relevant",
      "commonMisconceptions": "Common pitfall or exam trap to avoid"
    }
  ],
  "examQuestions": [
    {
      "question": "High-yield exam question",
      "questionType": "Conceptual or Problem-Solving",
      "difficulty": "Medium or Hard",
      "sampleAnswer": "Model solution explaining reasoning",
      "rubricTip": "What graders look for"
    }
  ],
  "recommendedTopics": [
    {
      "topicName": "Related topic name",
      "category": "Prerequisite or Advanced Next Step or Related Field",
      "whyImportant": "Why this matters to study",
      "keyIdea": "1-2 sentence core insight"
    }
  ],
  "recommendedQuestionsToAsk": [
    {
      "question": "Insightful question to ask",
      "context": "Why this question is crucial to ask",
      "targetAudience": "Ask Professor or TA / Office Hours or Self-Investigation"
    }
  ],
  "flashcards": [
    {
      "front": "Active recall question or concept",
      "back": "Concise definition or explanation"
    }
  ]
}`;

    const text = await generateWithFallback({
      model: model || "flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    if (!text) {
      throw new Error("No response received from AI model.");
    }

    const parsed = extractJSON(text);
    if (!parsed || !parsed.title) {
      throw new Error("Could not parse structured lecture data from the AI output.");
    }

    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error("Error in /api/summarize:", err);
    return res.status(500).json({
      error: err?.message || "Failed to structure lecture key points. Please check your notes or try again.",
    });
  }
});

// 2. POST /api/answer-question - Dynamically answers a clicked recommended question
app.post("/api/answer-question", async (req, res) => {
  try {
    const { question, lectureContext, subject, topic, model = "flash" } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question is required." });
    }

    const systemInstruction = `You are Sumrizer's interactive professor and tutor.
When a student clicks on an important lecture question, provide an illuminating, step-by-step, pedagogical answer.
Connect it directly back to the lecture concepts, clarify subtle points, provide an intuitive analogy, and offer 1 great follow-up insight.
Respond strictly in JSON format.`;

    const prompt = `Course / Subject: ${subject || "Academic Course"}
Topic: ${topic || "Lecture"}
Context from Lecture:
"""
${lectureContext || "General lecture context"}
"""

STUDENT'S QUESTION:
"${question}"

Return a valid JSON object conforming to:
{
  "question": "${question.replace(/"/g, '\\"')}",
  "directAnswer": "Direct 1-2 sentence core answer",
  "detailedExplanation": "Comprehensive step-by-step reasoning",
  "intuitiveExample": "Concrete real-world example or scenario",
  "keyTakeaway": "One essential insight to remember for exams",
  "suggestedFollowUp": "A logical follow-up question the student can reflect on"
}`;

    const text = await generateWithFallback({
      model: model || "flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = extractJSON(text || "{}");
    return res.json({ success: true, ...parsed });
  } catch (err: any) {
    console.error("Error in /api/answer-question:", err);
    return res.status(500).json({
      error: err?.message || "Failed to generate answer for the question.",
    });
  }
});

// 3. POST /api/explore-topic - Deep dive into a recommended topic
app.post("/api/explore-topic", async (req, res) => {
  try {
    const { topicName, lectureContext, subject, model = "flash" } = req.body;

    if (!topicName || typeof topicName !== "string") {
      return res.status(400).json({ error: "Topic name is required." });
    }

    const systemInstruction = `You are Sumrizer's conceptual topic explorer.
Explain this recommended topic with high clarity, detailing what it is, why it bridges with the current lecture, and core principles.
Respond strictly in JSON format.`;

    const prompt = `Course / Subject: ${subject || "Academic Course"}
Current Lecture Context:
"""
${lectureContext || "Lecture topics"}
"""

EXPLORE TOPIC:
"${topicName}"

Return a valid JSON object conforming to:
{
  "topicName": "${topicName.replace(/"/g, '\\"')}",
  "coreDefinition": "Clear definition of the topic",
  "connectionToLecture": "Exact connection to what was discussed in today's lecture",
  "keyPrinciples": ["Core principle 1", "Core principle 2", "Core principle 3"],
  "recommendedResources": ["Textbook or paper 1", "Resource 2"]
}`;

    const text = await generateWithFallback({
      model: model || "flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = extractJSON(text || "{}");
    return res.json({ success: true, ...parsed });
  } catch (err: any) {
    console.error("Error in /api/explore-topic:", err);
    return res.status(500).json({
      error: err?.message || "Failed to explore topic.",
    });
  }
});

// Serve frontend with Vite in dev, static in prod
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`Sumrizer server running on http://localhost:${PORT}`);
  });
}

startServer();
