# ScholarAI

An AI-powered study assistant built with React and Google Gemini. Upload a PDF, ask questions about it, take a quiz on the content, or just chat about any topic you're studying.

![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Features

- **AI Chat** — Ask questions on any topic and get clear, detailed explanations powered by Gemini 1.5 Flash
- **PDF Analysis** — Upload a PDF and chat with it; the document's content is passed as context to the AI
- **Quiz Generation** — Auto-generate multiple-choice questions from your current conversation or uploaded document
- **Voice Input** — Speak your questions using the browser's built-in Web Speech API
- **Chat History** — Conversations are saved locally in your browser so you can pick up where you left off

---

## Tech Stack

- **React 19** with hooks for state management
- **Google Gemini API** (`gemini-1.5-flash`)
- **PDF.js** for client-side PDF text extraction
- **Tailwind CSS** for styling
- **Web Speech API** for voice input
- **localStorage** for chat persistence (no backend required)

---
## Demo

<img width="1887" height="868" alt="image" src="https://github.com/user-attachments/assets/34a179b9-3c7a-4d9e-90ce-206a2d4e2c9f" />

## Personalized Quiz according to your study material

<img width="1908" height="880" alt="image" src="https://github.com/user-attachments/assets/276e682f-3492-4299-87aa-65da879a2ee6" />

## Getting Started

### Prerequisites

- Node.js v16+
- A [Google Gemini API key](https://makersuite.google.com/app/apikey) (free tier available)

### Installation

```bash
git clone https://github.com/Zimal-Fatemah/SCHOLAR-AI.git
cd SCHOLAR-AI
npm install
npm start
```

The app will open at `http://localhost:3000`.

### API Key Setup

When you first open the app, a settings panel will prompt you for your Gemini API key. Paste it in and click Save — it's stored only in your browser's localStorage and never sent anywhere except Google's API.

Alternatively, you can set it via environment variable:

```bash
cp .env.example .env.local
# Add your key to .env.local:
# REACT_APP_GEMINI_API_KEY=your_key_here
```

---

## Usage

**Chat:** Type or speak a question and get an AI response. The AI adapts its response style — brief for casual questions, detailed for complex topics.

**PDF Analysis:** Click the paperclip icon, upload a PDF (up to 10MB with selectable text), and then ask questions about it.

**Quiz:** After a conversation or PDF upload, click "Generate Quiz" to get a 5-question multiple-choice quiz on the content, with a 30-second timer per question.

**History:** Past chats are listed in the sidebar. Click any to reload it, or delete ones you no longer need.

---

## Limitations

- Voice input works best in Chrome and Edge; Firefox support is limited
- PDF text extraction requires PDFs with selectable text — scanned image PDFs won't work
- The Gemini free tier allows up to 1,500 requests/day and 60 requests/minute
- All data is stored in the browser; clearing localStorage will erase chat history.

---

## Deployment

The app is a standard Create React App project and can be deployed to Vercel, Netlify, or GitHub Pages with no configuration changes. Just set `REACT_APP_GEMINI_API_KEY` as an environment variable in your deployment settings.

---

## Contributing

Pull requests are welcome. For significant changes, please open an issue first to discuss what you'd like to change.

---

## License

MIT
