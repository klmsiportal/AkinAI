import { GoogleGenAI, Chat, GenerateContentResponse, Content, Part } from "@google/genai";
import { ChatMessage, Role, Attachment } from "../types";

// Initialize the Gemini Client
// CRITICAL: Ensure process.env.API_KEY is available in your deployment environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const createChatSession = (modelName: string = 'gemini-2.5-flash', historyMessages: ChatMessage[] = []) => {
  // Convert internal ChatMessage[] to Gemini Content[]
  const history: Content[] = historyMessages.map(msg => {
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
    
    // Add text
    if (msg.text) {
      parts.push({ text: msg.text });
    }

    return {
      role: msg.role === Role.USER ? 'user' : 'model',
      parts: parts
    };
  });

  return ai.chats.create({
    model: modelName,
    history: history,
    config: {
      systemInstruction: "You are AkinAI, a helpful, witty, and advanced AI assistant created by Akin S. Sokpah from Liberia. You are polite, knowledgeable, and strive to provide accurate information. Use Markdown for formatting.",
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
      const parts: any[] = []; // Using any to bypass strict type check for demo flexibility
      
      attachments.forEach(att => {
        parts.push({
            inlineData: {
                data: att.data,
                mimeType: att.mimeType
            }
        });
      });
      
      if (text) {
        parts.push({ text: text });
      }
      
      responseStream = await chat.sendMessageStream({ message: parts }); 
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