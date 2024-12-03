import { NextResponse } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatApiRequest } from "@/types/messages";
import { formatLLMResponse } from "@/utils/responseFormatter";

// Initialize API clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const formatCodeContext = (
  codeContext?: ChatApiRequest["codeContext"]
): string => {
  if (!codeContext || codeContext.files.length === 0) return "";

  const formattedFiles = codeContext.files
    .map(
      (file) => `----------
                ${file.relativePath}
                ${file.language}

                ${file.content}
                -----------`
    )
    .join("\n\n");

  return `Code Context:\n${formattedFiles}`;
};

export async function POST(request: Request) {
  try {
    const { message, model, systemPrompt, codeContext } =
      (await request.json()) as ChatApiRequest;
    const formattedCodeContext = formatCodeContext(codeContext);
    let response: string;

    console.log(model);
    if (model.startsWith("gpt") || model.startsWith("chatgpt")) {
      const messagesArray = [{ role: "system", content: systemPrompt }];

      if (formattedCodeContext) {
        messagesArray.push({ role: "user", content: formattedCodeContext });
      }

      messagesArray.push({ role: "user", content: message });

      const completion = await openai.chat.completions.create({
        model: model,
        messages: messagesArray as OpenAI.Chat.ChatCompletionMessageParam[],
      });
      response = formatLLMResponse(completion.choices[0].message.content || "");
    } else if (model.startsWith("claude")) {
      const messages = [];

      if (formattedCodeContext) {
        messages.push({ role: "user", content: formattedCodeContext });
      }

      messages.push({ role: "user", content: message });

      const completion = await anthropic.messages.create({
        model: model,
        messages: messages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        max_tokens: 50000,
      });
      response =
        completion.content[0].type === "text"
          ? formatLLMResponse(completion.content[0].text)
          : "";
    } else if (model.startsWith("gemini")) {
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = formattedCodeContext
        ? `${formattedCodeContext}\n\n${message}`
        : message;
      const result = await geminiModel.generateContent(prompt);
      response = formatLLMResponse(result.response.text());
    } else if (model.startsWith("llama")) {
      response = formatLLMResponse("LLama API implementation pending");
    } else {
      throw new Error("Invalid model selected");
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
