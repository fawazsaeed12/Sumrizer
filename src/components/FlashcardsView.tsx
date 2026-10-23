import React, { useState } from "react";
import { Flashcard } from "../types";
import { RotateCw, ChevronLeft, ChevronRight, Shuffle, CheckCircle2, BookOpen } from "lucide-react";

interface FlashcardsViewProps {
  flashcards: Flashcard[];
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ flashcards }) => {
  const [cards, setCards] = useState<Flashcard[]>(flashcards);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [mastered, setMastered] = useState<Record<number, boolean>>({});

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        No flashcards generated for this lecture.
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const toggleMastered = () => {
    setMastered((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  const masteredCount = Object.values(mastered).filter(Boolean).length;
  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top controls & progress */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-900">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <span aria-hidden="true">·</span>
          <span>{masteredCount} mastered</span>
        </div>

        <button
          type="button"
          onClick={handleShuffle}
          className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
          title="Shuffle cards"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Shuffle</span>
        </button>
      </div>

      {/* Progress line */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* The Flashcard Flip Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full min-h-[280px] sm:min-h-[320px] bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all relative select-none"
      >
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="uppercase font-semibold tracking-wider text-indigo-600">
            {isFlipped ? "Answer / Explanation" : "Prompt / Question"}
          </span>
          <span className="flex items-center gap-1 text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            <RotateCw className="w-3 h-3" />
            <span>Click to flip</span>
          </span>
        </div>

        <div className="py-6 flex items-center justify-center text-center">
          <div className="max-w-lg">
            {!isFlipped ? (
              <h4 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {currentCard.front}
              </h4>
            ) : (
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                {currentCard.back}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleMastered();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              mastered[currentIndex]
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{mastered[currentIndex] ? "Mastered" : "Mark as Mastered"}</span>
          </button>

          <span className="text-slate-400 text-[11px]">
            {isFlipped ? "Showing Back" : "Showing Front"}
          </span>
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handlePrev}
          className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Flip Card</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
