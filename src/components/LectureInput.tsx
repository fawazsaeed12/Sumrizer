import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Sparkles, BookOpen, Layers, Zap, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { SAMPLE_LECTURES, SampleLecture } from "../data/sampleLectures";

interface LectureInputProps {
  subject: string;
  setSubject: (val: string) => void;
  topic: string;
  setTopic: (val: string) => void;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  detailLevel: string;
  setDetailLevel: (val: string) => void;
  onSumrize: () => void;
  isLoading: boolean;
  model: string;
}

export const LectureInput: React.FC<LectureInputProps> = ({
  subject,
  setSubject,
  topic,
  setTopic,
  notes,
  setNotes,
  detailLevel,
  setDetailLevel,
  onSumrize,
  isLoading,
  model,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + " ";
          }
        }
        if (transcript) {
          setNotes((prev) => (prev ? `${prev}\n• ${transcript.trim()}` : `• ${transcript.trim()}`));
        }
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition error:", e.error);
        setIsListening(false);
        if (e.error === "not-allowed") {
          setSpeechError("Microphone permission was denied.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [setNotes]);

  const toggleSpeech = () => {
    if (!speechSupported || !recognitionRef.current) return;
    setSpeechError(null);
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  const handleSelectSample = (sample: SampleLecture) => {
    setSubject(sample.subject);
    setTopic(sample.topic);
    setNotes(sample.notes);
  };

  const insertHelper = (snippet: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = notes;
    const updated = current.substring(0, start) + snippet + current.substring(end);
    setNotes(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 10);
  };

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
  const bulletCount = (notes.match(/^[•\-\*]/gm) || []).length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 md:p-6 space-y-5">
      {/* Sample presets strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium text-slate-700">Quick-Load Sample Lectures:</span>
          <span>Click to populate instantly</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_LECTURES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors text-slate-700 font-medium text-left truncate max-w-[200px]"
              title={sample.title}
            >
              {sample.topic}
            </button>
          ))}
        </div>
      </div>

      {/* Subject and Topic inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Course / Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., CS 420 Distributed Systems"
            className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Lecture Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Consensus Algorithms & Raft"
            className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Textarea Toolbar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Lecture Key Points &amp; Notes
          </label>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => insertHelper("\n• ")}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              title="Add bullet point"
            >
              + Bullet
            </button>
            <button
              type="button"
              onClick={() => insertHelper(" [Slide #] ")}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              title="Add slide reference"
            >
              # Slide
            </button>
            <button
              type="button"
              onClick={() => insertHelper(" ⚠️ Exam Tip: ")}
              className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-medium transition-colors"
              title="Mark as exam tip"
            >
              ⚠️ Exam Hint
            </button>
            {speechSupported && (
              <button
                type="button"
                onClick={toggleSpeech}
                className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
                title="Dictate lecture points with voice"
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isListening ? "Listening..." : "Dictate"}</span>
              </button>
            )}
          </div>
        </div>

        {speechError && (
          <div className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-2 rounded border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={10}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={`Paste or type the key points you jot down in lectures here:
• What is the main thesis or problem?
• Core formulas, mechanisms, or processes
• Professor's emphasized warnings or exam tips
• Unresolved questions or bullet points from lecture slides...`}
            className="w-full text-sm p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono leading-relaxed text-slate-900 placeholder:text-slate-400 bg-slate-50/50 resize-y"
          />

          <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
            <div className="flex items-center gap-3">
              <span>{wordCount} words</span>
              <span aria-hidden="true">·</span>
              <span>{bulletCount > 0 ? `${bulletCount} key bullet points` : "Plain text / bullets"}</span>
            </div>
            {notes && (
              <button
                type="button"
                onClick={() => setNotes("")}
                className="text-xs text-slate-400 hover:text-red-600 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Detail Level & Engine Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
        <div>
          <span className="block text-xs font-semibold text-slate-700 mb-1.5">
            Analysis Rigor
          </span>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setDetailLevel("concise")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                detailLevel === "concise"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Fast Cram
            </button>
            <button
              type="button"
              onClick={() => setDetailLevel("comprehensive")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                detailLevel === "comprehensive"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Comprehensive (Standard)
            </button>
            <button
              type="button"
              onClick={() => setDetailLevel("in-depth")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                detailLevel === "in-depth"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Deep Theory
            </button>
          </div>
        </div>

        {/* Submit button */}
        <div className="sm:self-end">
          <button
            type="button"
            onClick={onSumrize}
            disabled={isLoading || !notes.trim()}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all ${
              isLoading || !notes.trim()
                ? "bg-slate-300 cursor-not-allowed text-slate-500 shadow-none"
                : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-indigo-200"
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sumrizing with Gemma...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Sumrize Lecture</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
