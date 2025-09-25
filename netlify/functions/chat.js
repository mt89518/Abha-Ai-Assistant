const { Handler } = require('@netlify/functions');
const Groq = require('groq-sdk');
const { tavily } = require('@tavily/core');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// Web search function
async function webSearch({ query }) {
    console.log('Calling web search for:', query);
    
    try {
        const response = await tvly.search(query);
        const finalResult = response.results.map((result) => result.content).join('\n\n');
        return finalResult;
    } catch (error) {
        console.error('Web search error:', error);
        return 'Sorry, I encountered an error while searching the web.';
    }
}

exports.handler = async (event, context) => {
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { message } = JSON.parse(event.body);
        
        if (!message) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Message is required' }),
            };
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
                        const toolResult = await webSearch(JSON.parse(functionParams));
                        
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
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ response: finalResponse }),
        };

    } catch (error) {
        console.error('Chat API error:', error);
        
        // Handle rate limiting specifically
        if (error.message && error.message.includes('429')) {
            return {
                statusCode: 429,
                headers,
                body: JSON.stringify({ 
                    error: 'Rate limit exceeded. Please wait a moment and try again.',
                    details: 'The AI service is currently busy. Please try again in a few seconds.',
                    retryAfter: 3
                }),
            };
        }
        
        // Handle model decommissioning
        if (error.message && error.message.includes('decommissioned')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'AI model temporarily unavailable',
                    details: 'The AI model is currently being updated. Please try again in a few minutes.',
                    type: 'model_unavailable'
                }),
            };
        }
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'An error occurred while processing your request',
                details: error.message,
                type: error.constructor.name
            }),
        };
    }
};
