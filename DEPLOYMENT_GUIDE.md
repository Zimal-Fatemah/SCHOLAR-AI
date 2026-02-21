# ScholarAI - Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended - Free & Easy)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Choose your project settings
   - Add environment variable: `REACT_APP_GEMINI_API_KEY` with your API key

3. **Set Environment Variable:**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add: `REACT_APP_GEMINI_API_KEY` = `your_api_key_here`

### Option 2: Netlify (Free & Easy)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   netlify deploy --prod --dir=build
   ```

3. **Set Environment Variable:**
   - Go to Netlify dashboard
   - Select your site
   - Go to Site settings > Environment variables
   - Add: `REACT_APP_GEMINI_API_KEY` = `your_api_key_here`

### Option 3: GitHub Pages (Free)

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json scripts:**
   ```json
   "homepage": "https://yourusername.github.io/my-app",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

### Option 4: Local Testing

1. **Install serve globally:**
   ```bash
   npm install -g serve
   ```

2. **Serve the build:**
   ```bash
   serve -s build
   ```

3. **Access at:** `http://localhost:3000`

## 🔧 Environment Variables Setup

### For Local Development:
Create `.env.local` file in project root:
```
REACT_APP_GEMINI_API_KEY=your_actual_api_key_here
```

### For Production Deployment:
Set the environment variable in your hosting platform:
- Variable name: `REACT_APP_GEMINI_API_KEY`
- Value: Your actual Gemini API key

## 📝 Pre-Deployment Checklist

- [ ] Build completed successfully (`npm run build`)
- [ ] Environment variable set correctly
- [ ] API key is valid and working
- [ ] All features tested locally

## 🎯 Recommended: Vercel Deployment

Vercel is the easiest option:

1. Run: `npm install -g vercel`
2. Run: `vercel`
3. Set environment variable in Vercel dashboard
4. Your app will be live at a URL like: `https://my-app-xyz.vercel.app`

## 🔗 Get Your Gemini API Key

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key and use it as your environment variable
