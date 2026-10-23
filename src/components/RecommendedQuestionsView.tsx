import React, { useState } from "react";
import { RecommendedQuestion, QuestionAnswer } from "../types";
import { MessageSquare, HelpCircle, ArrowRight, Sparkles, CheckCircle2, ChevronDown, ChevronUp, Send, Lightbulb, BookmarkCheck } from "lucide-react";

interface RecommendedQuestionsViewProps {
  questions: RecommendedQuestion[];
  answeredQuestions: Record<string, QuestionAnswer>;
  onAnswerQuestion: (question: string) => Promise<void>;
  isAnsweringQuestion: string | null;
  onAskCustomQuestion: (question: string) => Promise<void>;
}

export const RecommendedQuestionsView: React.FC<RecommendedQuestionsViewProps> = ({
  questions,
  answeredQuestions,
  onAnswerQuestion,
  isAnsweringQuestion,
  onAskCustomQuestion,
}) => {
  const [filterAudience, setFilterAudience] = useState<string>("all");
  const [customQuestionInput, setCustomQuestionInput] = useState<string>("");
  const [isSubmittingCustom, setIsSubmittingCustom] = useState<boolean>(false);

  const filteredQuestions = questions.filter((q) => {
    if (filterAudience === "all") return true;
    return q.targetAudience.toLowerCase().includes(filterAudience.toLowerCase());
  });

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestionInput.trim() || isSubmittingCustom) return;
    setIsSubmittingCustom(true);
    try {
      await onAskCustomQuestion(customQuestionInput.trim());
      setCustomQuestionInput("");
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Introduction banner */}
      <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              High-Impact Inquiries &amp; Interactive Answers
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              These are the crucial questions that expose edge-cases, clarify subtleties, and deepen exam comprehension.
              <strong className="text-indigo-900 font-semibold"> Click on any question below</strong> to have Sumrizer synthesize a structured, step-by-step answer.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and stats bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setFilterAudience("all")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterAudience === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Questions ({questions.length})
          </button>
          <button
            onClick={() => setFilterAudience("professor")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterAudience === "professor"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Ask Professor
          </button>
          <button
            onClick={() => setFilterAudience("ta")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterAudience === "ta"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Office Hours / TA
          </button>
        </div>

        <div className="text-xs text-slate-500">
          <span>{Object.keys(answeredQuestions).length} answered</span>
          <span aria-hidden="true"> · </span>
          <span>{questions.length - Object.keys(answeredQuestions).length} pending</span>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const answer = answeredQuestions[q.question];
          const isCurrentlyAnswering = isAnsweringQuestion === q.question;

          return (
            <div
              key={idx}
              className={`border rounded-xl transition-all overflow-hidden ${
                answer
                  ? "bg-white border-indigo-200 shadow-xs"
                  : "bg-white border-slate-200 hover:border-indigo-300 shadow-xs"
              }`}
            >
              {/* Question header row */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-indigo-700">
                        {q.targetAudience}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-slate-500">Question {idx + 1}</span>
                    </div>

                    <h4 className="text-base font-semibold text-slate-900 leading-snug">
                      {q.question}
                    </h4>

                    {q.context && (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        <span className="font-medium text-slate-600">Why ask this: </span>
                        {q.context}
                      </p>
                    )}
                  </div>

                  {/* Action button */}
                  <div className="shrink-0 pt-1">
                    {!answer ? (
                      <button
                        type="button"
                        onClick={() => onAnswerQuestion(q.question)}
                        disabled={isCurrentlyAnswering}
                        className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                          isCurrentlyAnswering
                            ? "bg-indigo-100 text-indigo-700 cursor-wait"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:shadow"
                        }`}
                      >
                        {isCurrentlyAnswering ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                            <span>Thinking...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                            <span>Answer Question</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Answered</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* If answer exists, display comprehensive answer card */}
                {answer && (
                  <div className="mt-4 pt-4 border-t border-indigo-100/80 space-y-3.5 bg-slate-50/70 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 rounded-b-xl">
                    {/* Direct core answer */}
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Core Answer</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 leading-relaxed">
                        {answer.directAnswer}
                      </p>
                    </div>

                    {/* Detailed explanation */}
                    <div className="text-xs text-slate-700 leading-relaxed space-y-1.5">
                      <div className="font-semibold text-slate-900">Detailed Mechanism:</div>
                      <p className="whitespace-pre-line">{answer.detailedExplanation}</p>
                    </div>

                    {/* Intuitive example */}
                    {answer.intuitiveExample && (
                      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-900 leading-relaxed">
                        <div className="flex items-center gap-1.5 font-semibold text-amber-800 mb-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                          <span>Intuitive Example</span>
                        </div>
                        <p>{answer.intuitiveExample}</p>
                      </div>
                    )}

                    {/* Key takeaway */}
                    {answer.keyTakeaway && (
                      <div className="flex items-start gap-2 p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs text-indigo-950">
                        <BookmarkCheck className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold text-indigo-900">Exam Takeaway: </span>
                          <span>{answer.keyTakeaway}</span>
                        </div>
                      </div>
                    )}

                    {/* Follow up question */}
                    {answer.suggestedFollowUp && (
                      <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-medium text-slate-700">Follow-up:</span>
                          <span className="italic truncate">{answer.suggestedFollowUp}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onAnswerQuestion(answer.suggestedFollowUp)}
                          className="shrink-0 text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 ml-2"
                        >
                          <span>Explore</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Question Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h4 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <span>Ask Your Own Question About This Lecture</span>
        </h4>
        <p className="text-xs text-slate-500 mb-3">
          Have a specific doubt or lecture point you want to unpack? Sumrizer will synthesize a direct answer grounded in your lecture notes.
        </p>

        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="text"
            value={customQuestionInput}
            onChange={(e) => setCustomQuestionInput(e.target.value)}
            placeholder="e.g., Why doesn't the Raft leader commit an entry from a previous term directly?"
            className="flex-1 text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!customQuestionInput.trim() || isSubmittingCustom}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-all ${
              !customQuestionInput.trim() || isSubmittingCustom
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-xs"
            }`}
          >
            {isSubmittingCustom ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
