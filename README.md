# AI Agent - ChatGPT Style Interface

A modern AI chat interface powered by Groq's Llama 3.1 and Tavily web search, styled like ChatGPT.

## Features

- 🤖 **AI Chat**: Powered by Groq's Llama 3.1-8b-instant model
- 🔍 **Web Search**: Real-time information via Tavily API
- 🎨 **ChatGPT UI**: Authentic ChatGPT-style dark theme interface
- 📱 **Responsive**: Works on desktop, tablet, and mobile
- ⚡ **Fast**: Built with Express.js and vanilla JavaScript

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file with:
   ```
   GROQ_API_KEY=your_groq_api_key
   TAVILY_API_KEY=your_tavily_api_key
   ```

3. **Run the application:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   Navigate to `http://localhost:3000`

## Deploy to Vercel

### Prerequisites
- [Vercel CLI](https://vercel.com/cli) installed: `npm i -g vercel`
- Vercel account

### Deployment Steps

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy the project:**
   ```bash
   vercel
   ```

3. **Set environment variables on Vercel:**
   ```bash
   vercel env add GROQ_API_KEY
   vercel env add TAVILY_API_KEY
   ```
   
   Or set them in the Vercel dashboard:
   - Go to your project dashboard
   - Navigate to Settings → Environment Variables
   - Add `GROQ_API_KEY` and `TAVILY_API_KEY`

4. **Redeploy with environment variables:**
   ```bash
   vercel --prod
   ```

### Alternative: Deploy via Git

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/ai-agent.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in project settings
   - Deploy automatically

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq API key for Llama 3.1 model | Yes |
| `TAVILY_API_KEY` | Tavily API key for web search | Yes |

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI**: Groq (Llama 3.1-8b-instant)
- **Search**: Tavily API
- **Deployment**: Vercel

## API Endpoints

- `GET /` - Serve the main chat interface
- `POST /api/chat` - Handle chat messages and AI responses
- `GET /api/health` - Health check endpoint

## License

ISC
