// server.js
import express from 'express';
import cors from 'cors';
import { mainAI } from './app.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/ask', async (req, res) => {
    const { question } = req.body;
    try {
        const answer = await mainAI(question);
        res.json({ answer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ answer: 'Error: AI failed to respond.' });
    }
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));
