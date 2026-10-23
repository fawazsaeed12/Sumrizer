export interface StructuredBreakdownPoint {
  pointTitle: string;
  conceptName: string;
  detailedExplanation: string;
  intuitiveAnalogy: string;
  realWorldApplication: string;
  keyFormulasOrCode?: string;
  commonMisconceptions?: string;
}

export interface ExamQuestion {
  question: string;
  questionType: string;
  difficulty: string;
  sampleAnswer: string;
  rubricTip: string;
}

export interface RecommendedTopic {
  topicName: string;
  category: string;
  whyImportant: string;
  keyIdea: string;
}

export interface RecommendedQuestion {
  question: string;
  context: string;
  targetAudience: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface SumrizerResult {
  title: string;
  subject: string;
  topic: string;
  executiveSummary: string;
  keyTakeaways: string[];
  structuredBreakdown: StructuredBreakdownPoint[];
  examQuestions: ExamQuestion[];
  recommendedTopics: RecommendedTopic[];
  recommendedQuestionsToAsk: RecommendedQuestion[];
  flashcards: Flashcard[];
}

export interface QuestionAnswer {
  question: string;
  directAnswer: string;
  detailedExplanation: string;
  intuitiveExample: string;
  keyTakeaway: string;
  suggestedFollowUp: string;
  answeredAt?: string;
}

export interface TopicDetail {
  topicName: string;
  coreDefinition: string;
  connectionToLecture: string;
  keyPrinciples: string[];
  recommendedResources: string[];
}

export interface SavedLecture {
  id: string;
  title: string;
  subject: string;
  topic: string;
  notes: string;
  createdAt: number;
  result: SumrizerResult;
  answeredQuestions: Record<string, QuestionAnswer>;
}
