const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize API clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post('/chat', async (req, res) => {
  const { message, model } = req.body;

  try {
    let response;

    if (model.startsWith('gpt')) {
      // OpenAI
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: message }],
      });
      response = completion.choices[0].message.content;
    } 
    else if (model.startsWith('claude')) {
      // Anthropic
      const completion = await anthropic.messages.create({
        model: model,
        messages: [{ role: 'user', content: message }],
        max_tokens: 1000,
      });
      response = completion.content[0].text;
    }
    else if (model.startsWith('gemini')) {
      // Google
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await geminiModel.generateContent(message);
      response = result.response.text();
    }
    else if (model.startsWith('llama')) {
      // Implementation for LLama API would go here
      response = "LLama API implementation pending";
    }

    res.json({ response });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});