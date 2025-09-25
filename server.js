import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Groq from 'groq-sdk';
import { tavily } from '@tavily/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Initialize AI services
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Web search function with status updates
async function webSearch({ query }, statusCallback) {
    console.log('Calling web search for:', query);
    
    if (statusCallback) {
        statusCallback(`🔍 Searching the web for: "${query}"`);
    }
    
    try {
        const response = await tvly.search(query);
        const finalResult = response.results.map((result) => result.content).join('\n\n');
        
        if (statusCallback) {
            statusCallback('🧠 Processing search results...');
        }
        
        return finalResult;
    } catch (error) {
        console.error('Web search error:', error);
        return 'Sorry, I encountered an error while searching the web.';
    }
}

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log('Received message:', message);

        // Initialize conversation with system message
        const messages = [
            {
                role: 'system',
                content: `You are a smart personal assistant who answers the asked questions.
                    You have access to following tools:
                    1. webSearch({query}: {query: string}) //Search the latest information and realtime data on the internet.
                    current date and time: ${new Date().toUTCString()}`,
            },
            {
                role: 'user',
                content: message,
            }
        ];

        let finalResponse = '';
        let conversationComplete = false;

        // Continue conversation until no more tool calls are needed
        while (!conversationComplete) {
            const completions = await groq.chat.completions.create({
                model: 'llama-3.1-8b-instant',
                temperature: 0,
                messages: messages,
                tools: [
                    {
                        type: 'function',
                        function: {
                            name: 'webSearch',
                            description: 'Search the latest information and realtime data on the internet.',
                            parameters: {
                                type: 'object',
                                properties: {
                                    query: {
                                        type: 'string',
                                        description: 'The search query to perform search on.',
                                    },
                                },
                                required: ['query'],
                            },
                        },
                    },
                ],
                tool_choice: 'auto',
            });

            const assistantMessage = completions.choices[0].message;
            messages.push(assistantMessage);

            const toolCalls = assistantMessage.tool_calls;

            if (!toolCalls) {
                // No more tool calls, conversation is complete
                finalResponse = assistantMessage.content;
                conversationComplete = true;
            } else {
                // Process tool calls
                for (const tool of toolCalls) {
                    const functionName = tool.function.name;
                    const functionParams = tool.function.arguments;

                    if (functionName === 'webSearch') {
                        // Create a status callback function (for future SSE implementation)
                        const statusCallback = (status) => {
                            console.log('Search status:', status);
                            // In future: could send SSE updates to frontend
                        };
                        
                        const toolResult = await webSearch(JSON.parse(functionParams), statusCallback);
                        
                        messages.push({
                            tool_call_id: tool.id,
                            role: 'tool',
                            name: functionName,
                            content: toolResult,
                        });
                    }
                }
            }
        }

        console.log('Final response:', finalResponse);
        res.json({ response: finalResponse });

        } catch (error) {
        console.error('Chat API error:', error);
        console.error('Error stack:', error.stack);
        
        // Handle model decommissioning
        if (error.message && error.message.includes('decommissioned')) {
            return res.status(400).json({ 
                error: 'AI model temporarily unavailable',
                details: 'The AI model is currently being updated. Please try again in a few minutes.',
                type: 'model_unavailable'
            });
        }
        
        // Handle rate limiting specifically
        if (error.message && error.message.includes('429')) {
            return res.status(429).json({ 
                error: 'Rate limit exceeded. Please wait a moment and try again.',
                details: 'The AI service is currently busy. Please try again in a few seconds.',
                retryAfter: 3
            });
        }
        
        // Handle other API errors
        if (error.message && error.message.includes('API')) {
            return res.status(503).json({ 
                error: 'AI service temporarily unavailable',
                details: 'Please try again in a moment.',
                type: 'service_unavailable'
            });
        }
        
        res.status(500).json({ 
            error: 'An error occurred while processing your request',
            details: error.message,
            type: error.constructor.name
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        services: {
            groq: !!process.env.GROQ_API_KEY,
            tavily: !!process.env.TAVILY_API_KEY
        }
    });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 AI Agent Web Server running at http://localhost:${port}`);
    console.log(`📱 Open your browser and navigate to http://localhost:${port}`);
    console.log(`🔧 API Health Check: http://localhost:${port}/api/health`);
});
