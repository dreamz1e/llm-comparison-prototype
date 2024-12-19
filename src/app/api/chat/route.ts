import { NextResponse } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatApiRequest, Response } from "@/types/messages";
import { formatLLMResponse } from "@/utils/responseFormatter";

// Initialize API clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

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
    const response: Response = {
      message: "",
      tokenUtils: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };

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
      response.message = formatLLMResponse(completion.choices[0].message.content || "");
      response.tokenUtils = {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      };
    } else if (model.startsWith("claude")) {
      const messages = [];

      if (formattedCodeContext) {
        messages.push({ role: "user", content: formattedCodeContext });
      }

      messages.push({ role: "user", content: message });

      const completion = await anthropic.messages.create({
        model: model,
        system: systemPrompt,
        messages: messages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        max_tokens: 8000,
      });
      response.message =
        completion.content[0].type === "text"
          ? formatLLMResponse(completion.content[0].text)
          : "";
      response.tokenUtils = {
        promptTokens: completion.usage?.input_tokens || 0,
        completionTokens: completion.usage?.output_tokens || 0,
        totalTokens: completion.usage?.input_tokens + completion.usage?.output_tokens || 0,
      };
    } else if (model.startsWith("gemini")) {
      const geminiModel = genAI.getGenerativeModel({ model: model });
      const chat = geminiModel.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: systemPrompt }],
          },
          {
            role: "model",
            parts: [{ text: "Understood, I will follow these instructions." }],
          },
        ],
      });

      const prompt = formattedCodeContext
        ? `${formattedCodeContext}\n\n${message}`
        : message;

      const result = await chat.sendMessage(prompt);
      response.message = formatLLMResponse(result.response.text());
      response.tokenUtils = {
        promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
        completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: result.response.usageMetadata?.totalTokenCount || 0,
      };
    } else if (model.startsWith("llama")) {
      response.message = formatLLMResponse("LLama API implementation pending");
    } else {
      throw new Error("Invalid model selected");
    }

    console.log(response);
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
