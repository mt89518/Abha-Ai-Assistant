# Netlify Deployment Guide

## 🚀 Deploy AI Agent to Netlify

Your AI Agent is now configured to work on Netlify using Netlify Functions!

### Files Added for Netlify:
- `netlify.toml` - Netlify configuration
- `netlify/functions/chat.js` - Main chat API function
- `netlify/functions/health.js` - Health check function
- `netlify/functions/package.json` - Function dependencies

### Deployment Steps:

#### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Go to [netlify.com](https://netlify.com)** and sign up/login
2. **Click "New site from Git"**
3. **Connect your GitHub repository**: `https://github.com/mt89518/Abha-Ai-Assistant.git`
4. **Build settings**:
   - Build command: `echo 'No build step required'`
   - Publish directory: `.` (root)
5. **Add Environment Variables**:
   - `GROQ_API_KEY` = `your_groq_api_key_here`
   - `TAVILY_API_KEY` = `your_tavily_api_key_here`
6. **Click "Deploy site"**

#### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy

# For production deployment
netlify deploy --prod
```

### How It Works:

1. **Static Files**: Your HTML, CSS, and JavaScript files are served as static assets
2. **API Routes**: Requests to `/api/chat` and `/api/health` are redirected to Netlify Functions
3. **Serverless Functions**: The chat logic runs in serverless functions on Netlify's edge network

### Environment Variables:
Make sure to set these in your Netlify dashboard:
- `GROQ_API_KEY`: Your Groq API key
- `TAVILY_API_KEY`: Your Tavily API key

### Testing Locally:
```bash
# Install dependencies
npm install

# Run Netlify dev server
npm run netlify:dev
```

### Benefits of Netlify:
- ✅ **Free tier** with generous limits
- ✅ **Automatic deployments** from GitHub
- ✅ **Global CDN** for fast loading
- ✅ **Serverless functions** for API endpoints
- ✅ **Easy environment variable management**
- ✅ **Custom domains** support

Your AI Agent will work exactly the same on Netlify as it does locally!
