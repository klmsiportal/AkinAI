import { GoogleGenAI, Chat, GenerateContentResponse, Content, Part } from "@google/genai";
import { ChatMessage, Role, Attachment } from "../types";

// Initialize the Gemini Client
// CRITICAL: Ensure process.env.API_KEY is available in your deployment environment
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: apiKey });

export const createChatSession = (modelName: string = 'gemini-2.5-flash', historyMessages: ChatMessage[] = []) => {
  // 1. Validation: Ensure API Key exists
  if (!apiKey) {
    console.warn("API Key is missing. Please set process.env.API_KEY in your environment.");
  }

  // 2. Filter History: Remove error messages and empty messages to prevent API 400 errors
  const validHistory = historyMessages.filter(msg => 
    !msg.isError && (msg.text.trim().length > 0 || (msg.attachments && msg.attachments.length > 0))
  );

  // 3. Map to Gemini Content format
  const history: Content[] = validHistory.map(msg => {
    const parts: Part[] = [];
    
    // Add attachments if any
    if (msg.attachments && msg.attachments.length > 0) {
      msg.attachments.forEach(att => {
        parts.push({
          inlineData: {
            data: att.data,
            mimeType: att.mimeType
          }
        });
      });
    }
    
    // Add text if present
    if (msg.text && msg.text.trim().length > 0) {
      parts.push({ text: msg.text });
    }

    return {
      role: msg.role === Role.USER ? 'user' : 'model',
      parts: parts
    };
  });

  // 4. Configure Thinking for Pro models if needed
  const isPro = modelName.includes('pro');
  const config: any = {
    systemInstruction: "You are AkinAI, a helpful, witty, and advanced AI assistant created by Akin S. Sokpah from Liberia. You are polite, knowledgeable, and strive to provide accurate information. Use Markdown for formatting.",
  };

  // Enable thinking for Gemini 3 Pro if requested
  if (isPro) {
    config.thinkingConfig = { thinkingBudget: 16000 }; // allocating budget for thinking
  }

  return ai.chats.create({
    model: modelName,
    history: history,
    config: config,
  });
};

export const sendMessageToGemini = async (
  chat: Chat,
  text: string,
  attachments: Attachment[] = []
): Promise<AsyncGenerator<string, void, unknown>> => {
  try {
    if (!apiKey) {
      throw new Error("API Key is missing. Please check your Vercel environment variables.");
    }

    // Construct the message parts strictly typed
    const parts: Part[] = [];

    if (attachments.length > 0) {
      attachments.forEach(att => {
        parts.push({
            inlineData: {
                data: att.data,
                mimeType: att.mimeType
            }
        });
      });
    }
    
    if (text) {
      parts.push({ text: text });
    }
    
    // Send message using the object syntax { message: ... }
    const responseStream = await chat.sendMessageStream({ message: parts });

    // Generator function to yield chunks
    async function* streamGenerator() {
      if (!responseStream) return;
      for await (const chunk of responseStream) {
        // Cast chunk to GenerateContentResponse
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          yield c.text;
        }
      }
    }

    return streamGenerator();

  } catch (error) {
    console.error("Gemini API Error details:", error);
    throw error;
  }
};