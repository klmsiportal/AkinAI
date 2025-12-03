import React, { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import { ChatMessage, ChatSession, Role, Attachment } from './types';
import { createChatSession, sendMessageToGemini, generateImage, generateSpeech, transcribeAudio } from './services/geminiService';
import { Chat } from '@google/genai';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [isRecording, setIsRecording] = useState(false);
  
  const chatInstanceRef = useRef<Chat | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (sessions.length === 0) {
      createNewChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initChatInstance = (model: string, history: ChatMessage[]) => {
    try {
        chatInstanceRef.current = createChatSession(model, history);
    } catch (e) {
        // If API key is missing, this will fail. We don't crash, just log.
        // The error will be surfaced when user tries to send a message.
        console.warn("Could not initialize chat session:", e);
        chatInstanceRef.current = null;
    }
  }

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      model: selectedModel
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setSidebarOpen(false);
    
    initChatInstance(selectedModel, []);
  };

  const handleSelectSession = (id: string) => {
    if (id === currentSessionId) return;
    
    setCurrentSessionId(id);
    const session = sessions.find(s => s.id === id);
    if (session) {
      initChatInstance(session.model || selectedModel, session.messages);
      setSidebarOpen(false); 
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    if (currentSessionId) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) {
        initChatInstance(model, session.messages);
      }
    }
  };

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        const audioChunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = async () => {
            setIsRecording(false);
            setIsLoading(true);
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); 
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = (reader.result as string).split(',')[1];
                try {
                    // Send to Transcription
                    const text = await transcribeAudio(base64Audio, 'audio/webm');
                    if (text) {
                        handleSendMessage(text, []);
                    }
                } catch (e: any) {
                    console.error(e);
                    if (e.message?.includes("API_KEY_MISSING")) {
                       alert("API Key is missing. Check settings.");
                    } else {
                       alert("Failed to transcribe audio.");
                    }
                    setIsLoading(false);
                }
            };
        };
        
        mediaRecorder.start();
        setIsRecording(true);
        
    } catch (err) {
        console.error("Microphone access denied", err);
        alert("Microphone access is required.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
    }
  };

  const handleToggleRecord = async () => {
      if (isRecording) {
          stopRecording();
      } else {
          await startRecording();
      }
  };

  const handleSendMessage = useCallback(async (text: string, attachments: Attachment[]) => {
    if (!currentSessionId) return;
    
    // Ensure chat instance exists
    if (!chatInstanceRef.current) {
         const session = sessions.find(s => s.id === currentSessionId);
         initChatInstance(selectedModel, session?.messages || []);
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: Role.USER,
      text: text,
      attachments: attachments,
      timestamp: Date.now(),
    };

    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        const newTitle = session.messages.length === 0 ? (text.slice(0, 30) + (text.length > 30 ? '...' : '')) : session.title;
        return { ...session, title: newTitle, messages: [...session.messages, userMsg] };
      }
      return session;
    }));

    setIsLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
    const aiPlaceholder: ChatMessage = {
      id: aiMsgId,
      role: Role.MODEL,
      text: '',
      timestamp: Date.now(),
      type: 'text'
    };

    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        return { ...session, messages: [...session.messages, aiPlaceholder] };
      }
      return session;
    }));

    try {
      // Feature: Check if user wants to generate an image
      const lowerText = text.toLowerCase();
      if (lowerText.startsWith("generate image") || lowerText.startsWith("draw") || lowerText.startsWith("create an image")) {
         // Image Generation Flow
         const imageBase64 = await generateImage(text);
         
         setSessions(prev => prev.map(session => {
             if (session.id === currentSessionId) {
                 const updatedMessages = session.messages.map(msg => {
                     if (msg.id === aiMsgId) {
                         const updatedMsg: ChatMessage = { 
                             ...msg, 
                             text: "Here is your image:", 
                             type: 'image_generation',
                             attachments: [{ type: 'image', data: imageBase64, mimeType: 'image/png' }]
                         };
                         return updatedMsg;
                     }
                     return msg;
                 });
                 return { ...session, messages: updatedMessages };
             }
             return session;
         }));

      } else if (lowerText.startsWith("speak") || lowerText.startsWith("say")) {
          // TTS Flow
          const speechText = text.replace(/^(speak|say)/i, "").trim();
          const audioBase64 = await generateSpeech(speechText || "Hello");

          setSessions(prev => prev.map(session => {
            if (session.id === currentSessionId) {
                const updatedMessages = session.messages.map(msg => {
                    if (msg.id === aiMsgId) {
                        const updatedMsg: ChatMessage = { 
                            ...msg, 
                            text: speechText, 
                            type: 'audio_generation',
                            attachments: [{ type: 'audio', data: audioBase64, mimeType: 'audio/mp3' }]
                        };
                        return updatedMsg;
                    }
                    return msg;
                });
                return { ...session, messages: updatedMessages };
            }
            return session;
        }));

      } else {
          // Standard Chat Flow
          // If instance is null here, it means apiKey was missing or init failed
          if (!chatInstanceRef.current) {
             throw new Error("API_KEY_MISSING");
          }

          const stream = await sendMessageToGemini(chatInstanceRef.current, text, attachments);
          let fullText = '';
          for await (const chunk of stream) {
            fullText += chunk;
            setSessions(prev => prev.map(session => {
              if (session.id === currentSessionId) {
                const updatedMessages = session.messages.map(msg => {
                  if (msg.id === aiMsgId) {
                    return { ...msg, text: fullText };
                  }
                  return msg;
                });
                return { ...session, messages: updatedMessages };
              }
              return session;
            }));
          }
      }

    } catch (error: any) {
      console.error(error);
      let errorMessage = "Sorry, something went wrong. Please try again.";
      
      if (error.message) {
        if (error.message.includes('API_KEY_MISSING') || error.message.includes('API Key is missing')) {
             errorMessage = "⚠️ **Action Required**: The API Key is missing.\n\nPlease go to your Vercel Dashboard → Settings → Environment Variables and add `API_KEY`.";
        } else if (error.message.includes('429')) {
             errorMessage = "⚠️ **Rate Limit**: Too many requests. Please wait a moment.";
        } else if (error.message.includes('503')) {
             errorMessage = "⚠️ **Service Unavailable**: Gemini is temporarily busy. Try again.";
        } else if (error.message.includes('SAFETY')) {
             errorMessage = "⚠️ **Safety Block**: The response was blocked by safety filters.";
        } else {
            errorMessage = `⚠️ **Error**: ${error.message}`;
        }
      }

      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          const updatedMessages = session.messages.map(msg => {
            if (msg.id === aiMsgId) {
              return { ...msg, text: errorMessage, isError: true };
            }
            return msg;
          });
          return { ...session, messages: updatedMessages };
        }
        return session;
      }));
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, selectedModel]);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <div className="flex h-screen w-full bg-gray-950 overflow-hidden text-white font-sans selection:bg-primary-500/30">
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={createNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selectedModel={selectedModel}
        onSelectModel={handleModelChange}
      />
      
      <ChatInterface 
        messages={currentSession?.messages || []}
        isLoading={isLoading}
        onSend={handleSendMessage}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onRecordAudio={handleToggleRecord}
        isRecording={isRecording}
      />
    </div>
  );
}

export default App;