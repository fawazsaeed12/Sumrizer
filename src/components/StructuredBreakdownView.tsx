import React, { useState } from "react";
import { StructuredBreakdownPoint } from "../types";
import { Lightbulb, Briefcase, AlertTriangle, Code, CheckCircle, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

interface StructuredBreakdownViewProps {
  summary: string;
  takeaways: string[];
  breakdown: StructuredBreakdownPoint[];
}

export const StructuredBreakdownView: React.FC<StructuredBreakdownViewProps> = ({
  summary,
  takeaways,
  breakdown,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [collapsedIndices, setCollapsedIndices] = useState<Record<number, boolean>>({});

  const toggleCollapse = (idx: number) => {
    setCollapsedIndices((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyPoint = (point: StructuredBreakdownPoint, index: number) => {
    const text = `### ${point.pointTitle} (${point.conceptName})\n${point.detailedExplanation}\n\nAnalogy: ${point.intuitiveAnalogy}\nApplication: ${point.realWorldApplication}${point.keyFormulasOrCode ? `\nFormula/Code: ${point.keyFormulasOrCode}` : ""}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Executive Summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <span>Executive Synthesis</span>
        </h3>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {summary}
        </p>

        {takeaways && takeaways.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-200/70">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              Core Takeaways
            </h4>
            <ul className="space-y-2">
              {takeaways.map((takeaway, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Point-by-point structured breakdown */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Concept-by-Concept Detailed Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Rigorous mechanics, real-world grounding, and pitfalls for every lecture point
            </p>
          </div>
          <span className="text-xs text-slate-500">
            {breakdown.length} Concepts Analyzed
          </span>
        </div>

        <div className="space-y-4">
          {breakdown.map((point, index) => {
            const isCollapsed = collapsedIndices[index];
            return (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Header */}
                <div
                  onClick={() => toggleCollapse(index)}
                  className="p-4 sm:p-5 flex items-start justify-between cursor-pointer bg-white hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold uppercase tracking-wider">
                      <span>Concept {index + 1}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-500 font-normal">{point.conceptName}</span>
                    </div>
                    <h4 className="text-base font-semibold text-slate-900 leading-snug">
                      {point.pointTitle}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyPoint(point, index);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      title="Copy this section"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
                    >
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Body */}
                {!isCollapsed && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 space-y-4 text-sm text-slate-800">
                    {/* Detailed explanation */}
                    <div className="pt-3">
                      <p className="leading-relaxed text-slate-700">
                        {point.detailedExplanation}
                      </p>
                    </div>

                    {/* Intuitive Analogy / Mental Model */}
                    {point.intuitiveAnalogy && (
                      <div className="p-3.5 bg-amber-50/60 border border-amber-200/70 rounded-lg text-xs leading-relaxed text-amber-900">
                        <div className="flex items-center gap-1.5 font-semibold text-amber-800 mb-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                          <span>Intuitive Mental Model</span>
                        </div>
                        <p>{point.intuitiveAnalogy}</p>
                      </div>
                    )}

                    {/* Real-World Application & Formulas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {point.realWorldApplication && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                            <span>Real-World Context</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            {point.realWorldApplication}
                          </p>
                        </div>
                      )}

                      {point.keyFormulasOrCode && (
                        <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono">
                          <div className="flex items-center gap-1.5 font-sans font-semibold text-indigo-300 mb-1">
                            <Code className="w-3.5 h-3.5" />
                            <span>Equation / Snippet</span>
                          </div>
                          <pre className="text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto text-emerald-400">
                            {point.keyFormulasOrCode}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Common Misconceptions */}
                    {point.commonMisconceptions && (
                      <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-lg text-xs text-rose-900">
                        <div className="flex items-center gap-1.5 font-semibold text-rose-800 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Common Student Misconception / Exam Trap</span>
                        </div>
                        <p className="leading-relaxed">{point.commonMisconceptions}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
