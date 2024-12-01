import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize API clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: Request) {
  try {
    const { message, model, systemPrompt } = await request.json();

    let response: string;

    if (model.startsWith('gpt')) {
      console.log(systemPrompt);
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
      });
      response = completion.choices[0].message.content || '';
    } 
    else if (model.startsWith('claude')) {
      const completion = await anthropic.messages.create({
        model: model,
        messages: [{ role: 'user', content: message }],
        max_tokens: 1000,
      });
      console.log(completion);
      response = "";
    }
    else if (model.startsWith('gemini')) {
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await geminiModel.generateContent(message);
      response = result.response.text();
    }
    else if (model.startsWith('llama')) {
      response = "LLama API implementation pending";
    }
    else {
      throw new Error('Invalid model selected');
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}