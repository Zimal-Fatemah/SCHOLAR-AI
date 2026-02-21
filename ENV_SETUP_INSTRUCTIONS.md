# Environment Setup Instructions

## Step 1: Create .env.local file

Create a file named `.env.local` in your project root directory (same level as package.json) with the following content:

```
REACT_APP_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

## Step 2: Get your Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Replace `your_actual_gemini_api_key_here` in the .env.local file with your actual API key

## Step 3: Restart the development server

After creating the .env.local file, restart your development server:

```bash
npm run dev
```

or

```bash
npm start
```

## Important Notes

- The .env.local file should be in the root directory (same level as package.json)
- Make sure the variable name is exactly `REACT_APP_GEMINI_API_KEY`
- Never commit the .env.local file to version control (it's already in .gitignore)
- The API key will be automatically loaded when you start the application
