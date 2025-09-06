// app.js
import Groq from 'groq-sdk';
import { tavily } from '@tavily/core';
import dotenv from 'dotenv';
dotenv.config();

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function mainAI(question) {
    const messages = [
        { role: 'system', content: `You are Abha, a smart AI assistant.
            When answering, always provide the response in a **structured format**:
            - Use numbered or bullet points where appropriate
            - Use headings or subheadings if necessary
            - Use code blocks for code
            - Use clear sections for steps, tips, or examples
            Current date: ${new Date().toUTCString()}` },
            { role: 'user', content: question }
    ];

    try {
        const completions = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            temperature: 0,
            messages,
        });

        const msg = completions.choices[0].message;
        return msg.content || "Sorry, I couldn't respond.";
    } catch (err) {
        console.error(err);
        return "Error: Unable to get response from AI.";
    }
}
