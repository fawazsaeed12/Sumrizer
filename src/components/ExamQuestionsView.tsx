import React, { useState } from "react";
import { ExamQuestion } from "../types";
import { HelpCircle, Eye, EyeOff, Award, CheckCircle, GraduationCap } from "lucide-react";

interface ExamQuestionsViewProps {
  questions: ExamQuestion[];
}

export const ExamQuestionsView: React.FC<ExamQuestionsViewProps> = ({ questions }) => {
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  const toggleReveal = (index: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const revealAll = () => {
    const all: Record<number, boolean> = {};
    questions.forEach((_, i) => (all[i] = true));
    setRevealedAnswers(all);
  };

  const hideAll = () => {
    setRevealedAnswers({});
  };

  return (
    <div className="space-y-6">
      {/* Intro and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span>High-Yield Exam Questions</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Crafted based on common midterm &amp; final exam formats for this material
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={revealAll}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-colors"
          >
            Reveal All Answers
          </button>
          <button
            type="button"
            onClick={hideAll}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-colors"
          >
            Hide All
          </button>
        </div>
      </div>

      {/* Question Cards */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const isRevealed = !!revealedAnswers[idx];

          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden"
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-700">Question {idx + 1}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-slate-500">{q.questionType}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span
                      className={`font-medium ${
                        q.difficulty.toLowerCase() === "hard"
                          ? "text-rose-600"
                          : "text-amber-600"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleReveal(idx)}
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {isRevealed ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide Answer</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Reveal Answer</span>
                      </>
                    )}
                  </button>
                </div>

                <h4 className="text-base font-semibold text-slate-900 leading-snug">
                  {q.question}
                </h4>

                {/* Model Answer Drawer */}
                {isRevealed && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 bg-slate-50/80 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 rounded-b-xl">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Model Solution / Rubric Answer</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-white p-3 rounded-lg border border-slate-200">
                        {q.sampleAnswer}
                      </p>
                    </div>

                    {q.rubricTip && (
                      <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs text-indigo-900 flex items-start gap-2">
                        <Award className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold text-indigo-950">Grader's Perspective: </span>
                          <span>{q.rubricTip}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
