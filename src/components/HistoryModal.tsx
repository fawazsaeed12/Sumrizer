import React, { useState } from "react";
import { SavedLecture } from "../types";
import { X, Clock, Trash2, BookOpen, Search, ArrowRight } from "lucide-react";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedLectures: SavedLecture[];
  onLoadLecture: (lecture: SavedLecture) => void;
  onDeleteLecture: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  savedLectures,
  onLoadLecture,
  onDeleteLecture,
}) => {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filtered = savedLectures.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.title.toLowerCase().includes(q) ||
      l.subject.toLowerCase().includes(q) ||
      l.topic.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Lecture Notebook History</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search past lectures by title or course..."
              className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              {savedLectures.length === 0
                ? "No lectures saved yet. Sumrize your first lecture to see it here!"
                : "No matching lectures found."}
            </div>
          ) : (
            filtered.map((lecture) => (
              <div
                key={lecture.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all flex items-start justify-between gap-4"
              >
                <div
                  onClick={() => {
                    onLoadLecture(lecture);
                    onClose();
                  }}
                  className="flex-1 cursor-pointer space-y-1"
                >
                  <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold">
                    <span>{lecture.subject || "General"}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-400 font-normal">
                      {new Date(lecture.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    {lecture.title || lecture.topic}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {lecture.notes.substring(0, 100)}...
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadLecture(lecture);
                      onClose();
                    }}
                    className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteLecture(lecture.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete lecture"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50">
          <span>{savedLectures.length} saved lectures in notebook</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
