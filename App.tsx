import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import { ChatMessage, ChatSession, Role, Attachment } from './types';
import { createChatSession, sendMessageToGemini } from './services/geminiService';
import { Chat } from '@google/genai';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref to hold the actual API Chat object. 
  // We don't store this in state because it's not serializable/renderable.
  const chatInstanceRef = React.useRef<Chat | null>(null);

  // Initialize first chat
  useEffect(() => {
    createNewChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setSidebarOpen(false);
    
    // Initialize Gemini Chat Instance
    chatInstanceRef.current = createChatSession();
  };

  const handleSendMessage = useCallback(async (text: string, attachments: Attachment[]) => {
    if (!currentSessionId || !chatInstanceRef.current) return;

    // 1. Add User Message to State
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: Role.USER,
      text: text,
      attachments: attachments,
      timestamp: Date.now(),
    };

    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        // Update Title if it's the first message
        const newTitle = session.messages.length === 0 ? (text.slice(0, 30) || "Image Chat") : session.title;
        return {
          ...session,
          title: newTitle,
          messages: [...session.messages, userMsg]
        };
      }
      return session;
    }));

    setIsLoading(true);

    // 2. Add Placeholder AI Message
    const aiMsgId = (Date.now() + 1).toString();
    const aiPlaceholder: ChatMessage = {
      id: aiMsgId,
      role: Role.MODEL,
      text: '', // Start empty
      timestamp: Date.now(),
    };

    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: [...session.messages, aiPlaceholder]
        };
      }
      return session;
    }));

    try {
      // 3. Stream Response
      const stream = await sendMessageToGemini(chatInstanceRef.current, text, attachments);
      
      let fullText = '';
      
      for await (const chunk of stream) {
        fullText += chunk;
        
        // Update the specific message in the specific session
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

    } catch (error) {
      console.error("Error sending message:", error);
      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          const updatedMessages = session.messages.map(msg => {
            if (msg.id === aiMsgId) {
              return { ...msg, text: "Sorry, I encountered an error processing your request. Please try again.", isError: true };
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
  }, [currentSessionId]);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden">
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => {
            setCurrentSessionId(id);
            // In a real app, you'd restore the Chat object history here
            chatInstanceRef.current = createChatSession(); 
            // NOTE: A simple chat instance reset loses context of previous messages in the API "memory"
            // for this session. A robust app handles history reconstruction.
            // For this UI-focused demo, we reset the connection for the new UI session.
        }}
        onNewChat={createNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <ChatInterface 
        messages={currentSession?.messages || []}
        isLoading={isLoading}
        onSend={handleSendMessage}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
    </div>
  );
}

export default App;
