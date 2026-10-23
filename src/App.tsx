import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { LectureInput } from "./components/LectureInput";
import { StructuredBreakdownView } from "./components/StructuredBreakdownView";
import { RecommendedQuestionsView } from "./components/RecommendedQuestionsView";
import { ExamQuestionsView } from "./components/ExamQuestionsView";
import { RecommendedTopicsView } from "./components/RecommendedTopicsView";
import { FlashcardsView } from "./components/FlashcardsView";
import { HistoryModal } from "./components/HistoryModal";
import { SumrizerResult, QuestionAnswer, TopicDetail, SavedLecture } from "./types";
import { SAMPLE_LECTURES } from "./data/sampleLectures";
import {
  FileText,
  HelpCircle,
  GraduationCap,
  Compass,
  Layers,
  ArrowRight,
  BookOpen,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Share2,
} from "lucide-react";

export default function App() {
  const [subject, setSubject] = useState<string>("Computer Science");
  const [topic, setTopic] = useState<string>("Raft Consensus Algorithm");
  const [notes, setNotes] = useState<string>(SAMPLE_LECTURES[0].notes);
  const [detailLevel, setDetailLevel] = useState<string>("comprehensive");
  const [model, setModel] = useState<string>("flash");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<SumrizerResult | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, QuestionAnswer>>({});
  const [isAnsweringQuestion, setIsAnsweringQuestion] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"breakdown" | "questions" | "exams" | "topics" | "flashcards">("breakdown");
  const [savedLectures, setSavedLectures] = useState<SavedLecture[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  // Load saved notebook lectures from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sumrizer_notebook");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedLectures(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not load notebook from localStorage:", e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const abortControllerRef = React.useRef<AbortController | null>(null);

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setLoadingStep("");
    setError("Lecture summarization cancelled.");
  };

  const handleSumrize = async () => {
    if (!notes.trim()) return;
    setIsLoading(true);
    setError(null);
    setLoadingStep("Reading key points and selecting best model...");

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 35000);

    const stepTimer1 = setTimeout(() => setLoadingStep("Analyzing concepts and mental models..."), 2000);
    const stepTimer2 = setTimeout(() => setLoadingStep("Generating high-yield exam questions and inquiries..."), 5000);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic,
          notes,
          detailLevel,
          model,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to process lecture notes.");
      }

      const newResult: SumrizerResult = json.data;
      setResult(newResult);
      setAnsweredQuestions({});
      setActiveTab("breakdown");

      // Save to Notebook
      const newSavedItem: SavedLecture = {
        id: "lec_" + Date.now(),
        title: newResult.title || topic || "Lecture Notes",
        subject: newResult.subject || subject,
        topic: newResult.topic || topic,
        notes,
        createdAt: Date.now(),
        result: newResult,
        answeredQuestions: {},
      };

      setSavedLectures((prev) => {
        const updated = [newSavedItem, ...prev.filter((item) => item.title !== newSavedItem.title)];
        try {
          localStorage.setItem("sumrizer_notebook", JSON.stringify(updated.slice(0, 30)));
        } catch (e) {}
        return updated;
      });

      showToast("Lecture key points successfully Sumrized!");
    } catch (err: any) {
      clearTimeout(timeoutId);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      if (err.name === "AbortError") {
        setError("The request took longer than expected or was cancelled. Please try again with 'Flash' mode.");
      } else {
        setError(err.message || "An error occurred while communicating with the AI service.");
      }
    } finally {
      setIsLoading(false);
      setLoadingStep("");
      abortControllerRef.current = null;
    }
  };

  const handleAnswerQuestion = async (questionText: string) => {
    if (!questionText || isAnsweringQuestion) return;
    setIsAnsweringQuestion(questionText);

    try {
      const lectureContext = result
        ? `${result.title}\n${result.executiveSummary}\nKey Takeaways:\n${result.keyTakeaways.join("\n")}`
        : notes;

      const res = await fetch("/api/answer-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
          lectureContext,
          subject: result?.subject || subject,
          topic: result?.topic || topic,
          model,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to answer question.");
      }

      const answerData: QuestionAnswer = {
        ...json,
        answeredAt: new Date().toISOString(),
      };

      setAnsweredQuestions((prev) => {
        const updated = { ...prev, [questionText]: answerData };
        // Sync with saved notebook
        if (result) {
          setSavedLectures((prevLectures) => {
            const nextLectures = prevLectures.map((l) =>
              l.result?.title === result.title ? { ...l, answeredQuestions: updated } : l
            );
            try {
              localStorage.setItem("sumrizer_notebook", JSON.stringify(nextLectures));
            } catch (e) {}
            return nextLectures;
          });
        }
        return updated;
      });

      showToast("Answer synthesized for question!");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to answer question. Please try again.");
    } finally {
      setIsAnsweringQuestion(null);
    }
  };

  const handleAskCustomQuestion = async (customQuestion: string) => {
    if (result) {
      // Add to recommended questions if not present
      if (!result.recommendedQuestionsToAsk.some((q) => q.question === customQuestion)) {
        setResult({
          ...result,
          recommendedQuestionsToAsk: [
            {
              question: customQuestion,
              context: "Custom student question submitted during study session",
              targetAudience: "Custom Inquiry",
            },
            ...result.recommendedQuestionsToAsk,
          ],
        });
      }
    }
    await handleAnswerQuestion(customQuestion);
  };

  const handleExploreTopic = async (topicName: string): Promise<TopicDetail | null> => {
    try {
      const lectureContext = result ? result.executiveSummary : notes;
      const res = await fetch("/api/explore-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicName,
          lectureContext,
          subject: result?.subject || subject,
          model,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to explore topic.");
      return json;
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Could not load topic details.");
      return null;
    }
  };

  const handleExportMarkdown = () => {
    if (!result) return;
    let md = `# ${result.title}\n`;
    md += `**Subject:** ${result.subject} · **Topic:** ${result.topic}\n\n`;
    md += `## Executive Summary\n${result.executiveSummary}\n\n`;

    md += `### Core Takeaways\n`;
    result.keyTakeaways.forEach((t) => (md += `- ${t}\n`));
    md += `\n`;

    md += `## Concept-by-Concept Structured Breakdown\n\n`;
    result.structuredBreakdown.forEach((pt, i) => {
      md += `### ${i + 1}. ${pt.pointTitle} (${pt.conceptName})\n`;
      md += `${pt.detailedExplanation}\n\n`;
      if (pt.intuitiveAnalogy) md += `> **Intuitive Analogy:** ${pt.intuitiveAnalogy}\n\n`;
      if (pt.realWorldApplication) md += `**Real-World Context:** ${pt.realWorldApplication}\n\n`;
      if (pt.keyFormulasOrCode) md += `\`\`\`\n${pt.keyFormulasOrCode}\n\`\`\`\n\n`;
      if (pt.commonMisconceptions) md += `*Exam Trap to Avoid:* ${pt.commonMisconceptions}\n\n`;
    });

    md += `## High-Yield Exam Questions & Model Solutions\n\n`;
    result.examQuestions.forEach((eq, i) => {
      md += `#### Q${i + 1} [${eq.difficulty} - ${eq.questionType}]: ${eq.question}\n`;
      md += `**Model Solution:**\n${eq.sampleAnswer}\n\n`;
      if (eq.rubricTip) md += `*Rubric Hint:* ${eq.rubricTip}\n\n`;
    });

    md += `## Questions to Ask & Answers\n\n`;
    result.recommendedQuestionsToAsk.forEach((rq, i) => {
      md += `#### ${i + 1}. [${rq.targetAudience}] ${rq.question}\n`;
      md += `*Context:* ${rq.context}\n\n`;
      const ans = answeredQuestions[rq.question];
      if (ans) {
        md += `**Core Answer:** ${ans.directAnswer}\n\n`;
        md += `${ans.detailedExplanation}\n\n`;
        if (ans.intuitiveExample) md += `*Example:* ${ans.intuitiveExample}\n\n`;
        if (ans.keyTakeaway) md += `*Exam Takeaway:* ${ans.keyTakeaway}\n\n`;
      }
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${result.topic.replace(/\s+/g, "_")}_Sumrizer_Notes.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Markdown notes exported!");
  };

  const handleNewLecture = () => {
    setSubject("");
    setTopic("");
    setNotes("");
    setResult(null);
    setAnsweredQuestions({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoadLecture = (saved: SavedLecture) => {
    setSubject(saved.subject);
    setTopic(saved.topic);
    setNotes(saved.notes);
    setResult(saved.result);
    setAnsweredQuestions(saved.answeredQuestions || {});
    setActiveTab("breakdown");
    showToast(`Loaded "${saved.title}"`);
  };

  const handleDeleteLecture = (id: string) => {
    setSavedLectures((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("sumrizer_notebook", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    showToast("Lecture removed from notebook.");
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        onNewLecture={handleNewLecture}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onExportMarkdown={handleExportMarkdown}
        hasResult={!!result}
        historyCount={savedLectures.length}
        currentModel={model}
        onSelectModel={(m) => {
          setModel(m);
          showToast(`Switched model to ${m === "gemma-4" ? "Gemma 4" : "Flash"}`);
        }}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* If no result yet, display clean hero introduction */}
        {!result && (
          <div className="text-center max-w-2xl mx-auto space-y-3 pt-2 pb-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Master Every Lecture with <span className="text-indigo-600">Sumrizer</span>
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Jot down bullet points, shorthand formulas, and lecturer tips. Sumrizer turns your raw notes into structured conceptual breakdowns, high-yield exam questions, and dynamic on-demand answers to critical inquiries.
            </p>
          </div>
        )}

        {/* Input Card */}
        <section>
          <LectureInput
            subject={subject}
            setSubject={setSubject}
            topic={topic}
            setTopic={setTopic}
            notes={notes}
            setNotes={setNotes}
            detailLevel={detailLevel}
            setDetailLevel={setDetailLevel}
            onSumrize={handleSumrize}
            isLoading={isLoading}
            model={model}
          />
        </section>

        {/* Loading Indicator with Stage Progression */}
        {isLoading && (
          <div className="bg-white border border-indigo-200 rounded-2xl p-8 text-center space-y-4 shadow-sm animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-900">
                Sumrizing Lecture Key Points...
              </h3>
              <p className="text-xs text-indigo-700 font-medium">
                {loadingStep || "Structuring concepts and synthesizing questions..."}
              </p>
            </div>
            <div className="max-w-xs mx-auto bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full w-2/3 animate-pulse rounded-full" />
            </div>
          </div>
        )}

        {/* Error message if any */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <p className="font-semibold">Generation Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Results Workspace */}
        {result && (
          <section className="space-y-6 pt-2">
            {/* Lecture Meta Banner */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold tracking-wide uppercase">
                  <span>{result.subject || "Academic Lecture"}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-400 font-normal">
                    {result.structuredBreakdown.length} Concepts Structured
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {result.title}
                </h2>
              </div>

              {/* Action tabs bar */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("breakdown")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-all ${
                    activeTab === "breakdown"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Structured Notes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("questions")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-all ${
                    activeTab === "questions"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Questions to Ask</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-1.5 rounded-full">
                    {result.recommendedQuestionsToAsk.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("exams")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-all ${
                    activeTab === "exams"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Exam Questions</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-1.5 rounded-full">
                    {result.examQuestions.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("topics")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-all ${
                    activeTab === "topics"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-sky-600" />
                  <span>Topics Roadmap</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("flashcards")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-all ${
                    activeTab === "flashcards"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <span>Flashcards</span>
                </button>
              </div>
            </div>

            {/* Active Tab Content */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
              {activeTab === "breakdown" && (
                <StructuredBreakdownView
                  summary={result.executiveSummary}
                  takeaways={result.keyTakeaways}
                  breakdown={result.structuredBreakdown}
                />
              )}

              {activeTab === "questions" && (
                <RecommendedQuestionsView
                  questions={result.recommendedQuestionsToAsk}
                  answeredQuestions={answeredQuestions}
                  onAnswerQuestion={handleAnswerQuestion}
                  isAnsweringQuestion={isAnsweringQuestion}
                  onAskCustomQuestion={handleAskCustomQuestion}
                />
              )}

              {activeTab === "exams" && (
                <ExamQuestionsView questions={result.examQuestions} />
              )}

              {activeTab === "topics" && (
                <RecommendedTopicsView
                  topics={result.recommendedTopics}
                  onExploreTopic={handleExploreTopic}
                />
              )}

              {activeTab === "flashcards" && (
                <FlashcardsView flashcards={result.flashcards} />
              )}
            </div>
          </section>
        )}
      </main>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedLectures={savedLectures}
        onLoadLecture={handleLoadLecture}
        onDeleteLecture={handleDeleteLecture}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Sumrizer</span>
            <span aria-hidden="true">·</span>
            <span>Intelligent Lecture Key Points &amp; Structured Study Companion</span>
          </div>
          <div className="text-slate-400">
            Powered by Google Gemma &amp; Gemini Intelligence
          </div>
        </div>
      </footer>
    </div>
  );
}
