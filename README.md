# 🎓 ScholarAI - AI-Powered Study Assistant

An intelligent study companion powered by Google's Gemini AI that helps you learn, understand concepts, analyze PDFs, and test your knowledge with interactive quizzes.

![ScholarAI](https://img.shields.io/badge/React-19.1.1-blue) ![Gemini-AI](https://img.shields.io/badge/Gemini-AI-green) ![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- 🤖 **AI Chat Interface** - Conversational learning with Google Gemini AI
- 📄 **PDF Analysis** - Upload and ask questions about your study materials
- 🎤 **Voice Input** - Speak your questions naturally
- 🎯 **Quiz Generator** - Auto-generate quizzes from content or conversations
- 💬 **Chat History** - Save and revisit your study sessions
- 🎨 **Beautiful UI** - Clean, modern interface with Tailwind CSS

## 🚀 Quick Start

### 1. Get Your Free API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Install & Run

```bash
# Clone the repository
git clone <your-repo-url>
cd my-app

# Install dependencies
npm install

# Start the app
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### 3. Enter Your API Key

When the app loads, you'll see a settings panel:
- Paste your API key
- Click "Save"
- Start chatting!

Your API key is stored securely in your browser's localStorage and never shared with anyone except Google's Gemini API.

## 📦 Alternative Setup (Optional)

If you prefer, you can add your API key to a `.env.local` file:

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your key
REACT_APP_GEMINI_API_KEY=your_api_key_here
```

## 🛠️ Available Scripts

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm run build`

Builds the app for production to the `build` folder.

### `npm test`

Launches the test runner in interactive watch mode.

## 📖 How to Use

### 1. **Chat with AI**
Simply type your questions or study topics and get detailed explanations.

### 2. **Upload PDFs**
Click the 📎 attachment icon to upload a PDF. Ask questions about the document content!

### 3. **Voice Input**
Click the 🎤 microphone icon to speak your questions instead of typing.

### 4. **Generate Quizzes**
Upload a PDF or have a conversation, then click "Generate Quiz" to test your knowledge!

### 5. **Save Chat History**
Your conversations are automatically saved. Access them from the sidebar.

## 🔒 Security & Privacy

- Your API key is stored only in your browser's localStorage
- No data is sent to any server except Google's Gemini API
- Your conversations are private and stored locally
- See [SECURITY.md](SECURITY.md) for detailed security information

## 🚀 Deployment

Deploy to Vercel, Netlify, or any static hosting service:

```bash
# Build for production
npm run build

# Deploy the build folder
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## 🛡️ API Key Best Practices

1. **Never commit** your `.env.local` file to version control
2. **Set API restrictions** in Google Cloud Console
3. **Monitor usage** regularly
4. **Rotate keys** periodically

## 📝 License

MIT License - Feel free to use this project for your own learning!

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 💡 Tips

- Start with simple questions to get familiar with the AI
- Upload study materials as PDFs for context-aware answers
- Use quizzes to test your understanding
- Save important conversations for later review

## 🐛 Troubleshooting

**"API key not found" error?**
- Make sure you've entered your API key and clicked "Save"
- Check that your API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)

**PDF upload not working?**
- Ensure the file is a valid PDF
- Maximum file size is 10MB
- Make sure the PDF contains extractable text (not just images)

**Voice input not working?**
- Allow microphone permissions in your browser
- Use Chrome or Edge for best compatibility

## 📧 Support

Need help? Check the [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md) for detailed information about the project.

---

Built with ❤️ using React and Google Gemini AI
