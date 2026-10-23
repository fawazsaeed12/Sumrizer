import React from "react";
import { BookOpen, Sparkles, History, PlusCircle, Download, FileText, Cpu } from "lucide-react";

interface HeaderProps {
  onNewLecture: () => void;
  onOpenHistory: () => void;
  onExportMarkdown: () => void;
  hasResult: boolean;
  historyCount: number;
  currentModel: string;
  onSelectModel: (model: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewLecture,
  onOpenHistory,
  onExportMarkdown,
  hasResult,
  historyCount,
  currentModel,
  onSelectModel,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">Sumrizer</span>
              <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-semibold">
                Gemma · Gemini
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Turn lecture key points into structured mastery &amp; on-demand Q&amp;A
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Model Selector */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 text-xs border border-slate-200">
            <button
              type="button"
              onClick={() => onSelectModel("flash")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                currentModel === "flash"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Fastest, instant academic summarization"
            >
              Flash
            </button>
            <button
              type="button"
              onClick={() => onSelectModel("gemma-4")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                currentModel === "gemma-4"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Gemma 4 open architecture"
            >
              Gemma 4
            </button>
          </div>

          {/* History */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            title="Saved Lectures"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Notebook</span>
            {historyCount > 0 && (
              <span className="text-[11px] bg-slate-300 text-slate-800 font-semibold px-1.5 rounded-full">
                {historyCount}
              </span>
            )}
          </button>

          {/* Export button */}
          {hasResult && (
            <button
              onClick={onExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-xs"
              title="Export Lecture Notes as Markdown"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {/* New Lecture */}
          <button
            onClick={onNewLecture}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Lecture</span>
          </button>
        </div>
      </div>
    </header>
  );
};
