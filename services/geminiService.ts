import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ChatMessage, Role, Attachment } from "../types";

// Initialize the Gemini Client
// CRITICAL: Ensure process.env.API_KEY is available in your deployment environment (e.g., Vercel Environment Variables)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const createChatSession = (modelName: string = 'gemini-2.5-flash') => {
  return ai.chats.create({
    model: modelName,
    config: {
      systemInstruction: "You are AkinAI, a helpful, witty, and advanced AI assistant created by Akin S. Sokpah from Liberia. You are polite, knowledgeable, and strive to provide accurate information.",
    },
  });
};

export const sendMessageToGemini = async (
  chat: Chat,
  text: string,
  attachments: Attachment[] = []
): Promise<AsyncGenerator<string, void, unknown>> => {
  try {
    let responseStream;

    if (attachments.length > 0) {
      // If there are images, we need to use a slightly different approach or just pass parts
      // The SDK's chat.sendMessageStream supports passing a string message.
      // For multimodal history in chat, we often need to construct the history manually or use the helper.
      // However, for simplicity in this demo, if there are attachments, we might treat it as a single generation
      // or try to pass parts if the method signature allows.
      // The current SDK Chat.sendMessage supports `string | (string | Part)[]`.
      
      const parts: any[] = [];
      
      attachments.forEach(att => {
        parts.push({
            inlineData: {
                data: att.data,
                mimeType: att.mimeType
            }
        });
      });
      
      parts.push({ text: text });

      // Note: In strict TypeScript SDK, sendMessageStream argument is typed as { message: ... }
      // The `message` property can handle complex content in some versions, but to be safe and strictly follow 
      // the "Chat (Streaming)" guidelines which say "only accepts the message parameter", we pass the string or parts.
      // However, the types provided in the guideline for `sendMessageStream` input is `{ message: string | Array<string | Part> }`.
      
      responseStream = await chat.sendMessageStream({ message: parts as any }); 
    } else {
      responseStream = await chat.sendMessageStream({ message: text });
    }

    // Generator function to yield chunks
    async function* streamGenerator() {
      if (!responseStream) return;
      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          yield c.text;
        }
      }
    }

    return streamGenerator();

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
