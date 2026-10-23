import React, { useState } from "react";
import { RecommendedTopic, TopicDetail } from "../types";
import { Compass, BookOpen, ExternalLink, X, ArrowUpRight, Sparkles, BookMarked } from "lucide-react";

interface RecommendedTopicsViewProps {
  topics: RecommendedTopic[];
  onExploreTopic: (topicName: string) => Promise<TopicDetail | null>;
}

export const RecommendedTopicsView: React.FC<RecommendedTopicsViewProps> = ({
  topics,
  onExploreTopic,
}) => {
  const [selectedTopicDetail, setSelectedTopicDetail] = useState<TopicDetail | null>(null);
  const [loadingTopic, setLoadingTopic] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = ["all", "prerequisite", "advanced next step", "related field"];

  const filteredTopics = topics.filter((t) => {
    if (activeCategory === "all") return true;
    return t.category.toLowerCase().includes(activeCategory);
  });

  const handleDeepDive = async (topicName: string) => {
    setLoadingTopic(topicName);
    try {
      const detail = await onExploreTopic(topicName);
      if (detail) {
        setSelectedTopicDetail(detail);
      }
    } finally {
      setLoadingTopic(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-600" />
          <span>Recommended Topic Roadmap</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Curated conceptual dependencies, advanced trajectories, and cross-disciplinary links recommended by Sumrizer to round out your mastery.
        </p>

        {/* Filter */}
        <div className="flex flex-wrap gap-1 mt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                activeCategory === cat
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              {cat === "all" ? "All Recommendations" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTopics.map((topic, idx) => {
          const isLoading = loadingTopic === topic.topicName;

          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-indigo-600 uppercase tracking-wider text-[11px]">
                    {topic.category}
                  </span>
                  <span>Topic #{idx + 1}</span>
                </div>

                <h4 className="text-base font-semibold text-slate-900 leading-snug">
                  {topic.topicName}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {topic.whyImportant}
                </p>

                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 italic border border-slate-100">
                  <span className="font-semibold text-slate-800 not-italic">Key Idea: </span>
                  {topic.keyIdea}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleDeepDive(topic.topicName)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                      <span>Exploring...</span>
                    </>
                  ) : (
                    <>
                      <span>Deep Dive Primer</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Dive Modal */}
      {selectedTopicDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  Conceptual Deep Dive
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedTopicDetail.topicName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTopicDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div>
                <h5 className="font-semibold text-slate-900 mb-1">Core Definition:</h5>
                <p className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  {selectedTopicDetail.coreDefinition}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-slate-900 mb-1">Connection to Today's Lecture:</h5>
                <p className="bg-indigo-50/60 p-3.5 rounded-lg border border-indigo-100 text-indigo-950">
                  {selectedTopicDetail.connectionToLecture}
                </p>
              </div>

              {selectedTopicDetail.keyPrinciples?.length > 0 && (
                <div>
                  <h5 className="font-semibold text-slate-900 mb-2">Key Principles:</h5>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-600 pl-1">
                    {selectedTopicDetail.keyPrinciples.map((principle, i) => (
                      <li key={i}>{principle}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedTopicDetail.recommendedResources?.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <h5 className="font-semibold text-slate-900 mb-2">Recommended Reading &amp; Textbooks:</h5>
                  <div className="space-y-1.5">
                    {selectedTopicDetail.recommendedResources.map((res, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-600">
                        <BookMarked className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{res}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTopicDetail(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
