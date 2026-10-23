# Sumrizer

Sumrizer is an AI-powered lecture companion built on Google's Gemma and Gemini language models. It transforms raw, fragmented notes and bullet points taken during academic lectures into comprehensive, structured study materials, complete with conceptual breakdowns, high-yield exam questions, topic roadmaps, and on-demand interactive question answering.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Development Server](#development-server)
  - [Production Build](#production-build)
- [Backend API Reference](#backend-api-reference)
- [How to Use Sumrizer](#how-to-use-sumrizer)
- [License](#license)

---

## Overview

During fast-paced university lectures, students frequently write shorthand notes, formulas, slide references, and partial bullet points. Sumrizer bridges the gap between quick in-class scribbles and structured academic mastery:

1. Ingests messy, quick-typed, or voice-dictated lecture key points.
2. Synthesizes an executive conceptual summary and core takeaways.
3. Deconstructs every individual key point into academic definitions, underlying mechanics, intuitive mental models, practical industry applications, and common student misconceptions.
4. Generates high-yield exam questions with model answers and grading rubric advice.
5. Suggests critical questions to ask professors or teaching assistants, and provides immediate, detailed answers when clicked.
6. Maps out prerequisite and advanced next-step topics with instant deep dive summaries.
7. Produces interactive active-recall flashcards for rapid revision before tests.

---

## Key Features

### 1. Structured Concept Breakdown
- Executive Synthesis: Delivers an academic high-level overview establishing context.
- Concept Cards: Each lecture point receives a structured analysis covering core definition, mechanics, relatable mental model, real-world context, mathematical equations or code snippets, and common pitfalls to avoid on tests.

### 2. Interactive Questions to Ask (Click-to-Answer)
- Recommends high-impact questions categorized by context (Ask Professor, Office Hours / TA, Self-Study).
- Clicking any question calls the AI engine to generate an immediate, comprehensive answer containing direct explanation, step-by-step reasoning, intuitive examples, and exam takeaways.
- Includes a custom question prompt allowing students to ask specific doubts about their lecture notes anytime.

### 3. Exam Preparation & Model Solutions
- Generates exam-style questions across multiple difficulty levels (Medium, Hard) and formats (Conceptual, Analytical, Problem-Solving).
- Includes toggleable model answers and insights into what graders look for when scoring responses.

### 4. Topic Roadmap & Deep Dive Exploration
- Maps out prerequisite topics, advanced next-step topics, and cross-disciplinary applications.
- One-click conceptual deep dives provide clear definitions, direct connection to the current lecture, core principles, and recommended textbooks or papers.

### 5. Active Recall Study Cards
- Auto-generates study flashcards from the lecture's core concepts.
- Features flip animation, card shuffling, and mastery progress tracking.

### 6. Voice Dictation & Sample Presets
- Built-in speech-to-text dictation using the Web Speech API to capture live lecturer quotes or spoken thoughts.
- Includes 4 preloaded sample lectures across Computer Science, Molecular Biology, Economics, and Modern Physics for instant testing.

### 7. Notebook Persistence & Markdown Export
- Automatically saves lectures to local browser storage with full search capability.
- Exports complete, cleanly formatted lecture study guides to standard Markdown (.md) files.

---

## System Architecture

Sumrizer follows a full-stack single-port architecture:

```
[ Client: React + TypeScript + Tailwind CSS ]
                     |
                     |  JSON API (/api/*)
                     v
[ Server: Node.js + Express + Vite Middleware ]
                     |
                     |  @google/genai SDK (Server-Side Proxy)
                     v
[ Google AI Models: Gemma & Gemini ]
```

- Client-side code never communicates directly with external AI APIs or exposes credentials.
- All model interactions are routed through secure, server-side Express endpoints.
- In development, Vite middlewares are mounted onto the Express application, serving the client and backend on port 3000 simultaneously.

---

## Tech Stack

- Frontend: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- Backend: Node.js, Express, tsx
- AI Engine: Google GenAI SDK (`@google/genai`) using Gemini and Gemma models
- Build & Bundling: Vite

---

## Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm or yarn

### Installation

Clone the repository and install project dependencies:

```bash
git clone https://github.com/your-username/sumrizer.git
cd sumrizer
npm install
```

### Environment Configuration

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Set your Gemini API key in `.env`:

```env
GEMINI_API_KEY="YOUR_ACTUAL_API_KEY"
```

In Google AI Studio or Cloud Run environments, `GEMINI_API_KEY` is automatically injected into the process environment.

### Development Server

Start the full-stack development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

### Production Build

To build the client bundle for production:

```bash
npm run build
```

To run the production server:

```bash
npm start
```

---

## Backend API Reference

### 1. Summarize Lecture Key Points

- Endpoint: `POST /api/summarize`
- Headers: `Content-Type: application/json`
- Request Body:

```json
{
  "subject": "Computer Science",
  "topic": "Raft Consensus Algorithm",
  "notes": "• Leader election timeouts\n• Log replication quorums\n• Split-brain prevention",
  "detailLevel": "comprehensive",
  "model": "gemini-3.8-flash"
}
```

- Response: Returns a structured JSON object containing `title`, `executiveSummary`, `keyTakeaways`, `structuredBreakdown`, `examQuestions`, `recommendedTopics`, `recommendedQuestionsToAsk`, and `flashcards`.

### 2. Answer a Lecture Question

- Endpoint: `POST /api/answer-question`
- Headers: `Content-Type: application/json`
- Request Body:

```json
{
  "question": "Why does Raft enforce randomized election timeouts?",
  "lectureContext": "Full lecture summary and notes context...",
  "subject": "Computer Science",
  "topic": "Raft Consensus Algorithm",
  "model": "gemini-3.8-flash"
}
```

- Response: Returns `directAnswer`, `detailedExplanation`, `intuitiveExample`, `keyTakeaway`, and `suggestedFollowUp`.

### 3. Explore a Recommended Topic

- Endpoint: `POST /api/explore-topic`
- Headers: `Content-Type: application/json`
- Request Body:

```json
{
  "topicName": "Paxos Consensus Algorithm",
  "lectureContext": "Lecture summary...",
  "subject": "Computer Science",
  "model": "gemini-3.8-flash"
}
```

- Response: Returns `topicName`, `coreDefinition`, `connectionToLecture`, `keyPrinciples`, and `recommendedResources`.

---

## How to Use Sumrizer

1. Enter Course Details: Input your course subject and the lecture topic (or click one of the quick-load presets).
2. Input Key Points: Type or paste your lecture notes. You can use formatting helpers to tag bullets, slide numbers, and exam alerts, or use the Dictate button for voice note-taking.
3. Select Analysis Rigor: Choose between Fast Cram, Comprehensive, or Deep Theory.
4. Click "Sumrize Lecture": The AI structures your notes and builds your complete revision suite.
5. Explore the Tabs:
   - Structured Notes: Read the point-by-point breakdown and mental models.
   - Questions to Ask: Click on any recommended question to get an instant, in-depth explanation.
   - Exam Questions: Test yourself, then reveal model solutions and grading tips.
   - Topics Roadmap: Check prerequisite and follow-up topics, and click Deep Dive Primer for quick topic overviews.
   - Flashcards: Use the flip cards for active recall practice.
6. Save & Export: Your lecture is automatically stored in your Notebook, and you can export the full notes as Markdown (.md) anytime.

---

## License

This project is licensed under the open-source MIT License. See the [LICENSE](LICENSE) file for complete details.
