import { GoogleGenAI, Chat, GenerateContentResponse, Content, Part, Modality } from "@google/genai";
import { ChatMessage, Role, Attachment } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: apiKey });

export const createChatSession = (modelName: string = 'gemini-2.5-flash', historyMessages: ChatMessage[] = []) => {
  if (!apiKey) {
    console.warn("API Key is missing. Please set process.env.API_KEY in your environment.");
  }

  const validHistory = historyMessages.filter(msg => 
    !msg.isError && (msg.text.trim().length > 0 || (msg.attachments && msg.attachments.length > 0))
  );

  const history: Content[] = validHistory.map(msg => {
    const parts: Part[] = [];
    
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
    
    if (msg.text && msg.text.trim().length > 0) {
      parts.push({ text: msg.text });
    }

    return {
      role: msg.role === Role.USER ? 'user' : 'model',
      parts: parts
    };
  });

  const config: any = {
    systemInstruction: "You are AkinAI, a sophisticated and helpful AI assistant created by Akin S. Sokpah. You are capable of complex reasoning, coding, and creative tasks. Use Markdown for formatting.",
  };

  // Thinking Config for Pro Model
  if (modelName === 'gemini-3-pro-preview') {
    config.thinkingConfig = { thinkingBudget: 32768 }; 
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
  if (!apiKey) throw new Error("API Key is missing.");

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
  
  const responseStream = await chat.sendMessageStream({ message: parts });

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
};

// --- New Features ---

// 1. Image Generation
export const generateImage = async (prompt: string, aspectRatio: string = "1:1"): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing.");
  
  // Use generateContent for nano banana series as per instructions
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: "1K"
      }
    }
  });

  // Extract image
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }
  }
  throw new Error("No image generated");
};

// 2. TTS
export const generateSpeech = async (text: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
      },
    },
  });

  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) throw new Error("No audio generated");
  return audioData;
};

// 3. Audio Transcription (for Mic input)
export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
    if (!apiKey) throw new Error("API Key is missing.");

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // Good for transcription
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64Audio,
                        mimeType: mimeType
                    }
                },
                { text: "Transcribe this audio exactly as spoken." }
            ]
        }
    });
    
    return response.text || "";
}
