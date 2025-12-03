import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, Role, Attachment } from '../types';
import TypewriterText from './TypewriterText';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (text: string, attachments: Attachment[]) => void;
  onToggleSidebar: () => void;
}

const SUGGESTIONS = [
  { icon: '💻', text: 'Write a Python script', sub: 'to scrape stock prices' },
  { icon: '🎨', text: 'Design a logo concept', sub: 'for a coffee shop' },
  { icon: '🧠', text: 'Explain Quantum Physics', sub: 'like I am five' },
  { icon: '📝', text: 'Draft an email', sub: 'requesting a vacation' },
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onSend, onToggleSidebar }) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    if ((!inputText.trim() && attachments.length === 0) || isLoading) return;
    onSend(inputText, attachments);
    setInputText('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64String = (event.target.result as string).split(',')[1];
          setAttachments(prev => [...prev, {
            type: 'image',
            data: base64String,
            mimeType: file.type
          }]);
        }
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 flex flex-col h-full relative bg-gray-950 text-gray-100">
      {/* Top Bar (Mobile) */}
      <div className="md:hidden sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 p-3 flex items-center justify-between">
        <button onClick={onToggleSidebar} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <span className="font-semibold text-white tracking-tight">AkinAI</span>
        <div className="w-10"></div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto p-4 md:p-6 pb-32 min-h-full flex flex-col">
          
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-fadeIn py-10">
              <div className="mb-8 relative group cursor-default">
                 <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                 <div className="relative w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center border border-gray-800 shadow-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-primary-500">
                        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                    </svg>
                 </div>
              </div>
              
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 mb-3">Hello, I'm AkinAI</h1>
              <p className="text-gray-400 max-w-md text-lg leading-relaxed mb-10">
                Powered by Gemini. How can I help you today?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {SUGGESTIONS.map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => onSend(s.text + " " + s.sub, [])}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 hover:border-gray-700 transition-all text-left group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{s.icon}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-200">{s.text}</span>
                      <span className="text-xs text-gray-500">{s.sub}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex w-full mb-6 ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  flex max-w-[90%] md:max-w-[80%] 
                  ${msg.role === Role.USER ? 'flex-row-reverse' : 'flex-row'}
                  gap-4
                `}>
                  {/* Avatar */}
                  <div className="flex-shrink-0 mt-1">
                    {msg.role === Role.MODEL ? (
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border border-white/10 ${msg.isError ? 'bg-red-900/50' : 'bg-gradient-to-tr from-primary-600 to-indigo-600'}`}>
                          {msg.isError ? (
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-400">
                               <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                             </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                                <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6 20.25a.75.75 0 01.75.75v.75h.75a.75.75 0 010 1.5h-.75v.75a.75.75 0 01-1.5 0v-.75h-.75a.75.75 0 010-1.5h.75v-.75a.75.75 0 01.75-.75zM17.5 8a.75.75 0 01.75-.75h.75v-.75a.75.75 0 011.5 0v.75h.75a.75.75 0 010 1.5h-.75v.75a.75.75 0 01-1.5 0v-.75h-.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                            </svg>
                          )}
                       </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={`
                    flex flex-col min-w-0
                    ${msg.role === Role.USER ? 'items-end' : 'items-start'}
                  `}>
                    <div className={`
                      px-5 py-3 rounded-2xl shadow-sm text-sm leading-6 md:text-base md:leading-7
                      ${msg.role === Role.USER 
                        ? 'bg-gray-800 text-white rounded-tr-sm border border-gray-700' 
                        : msg.isError 
                            ? 'bg-red-900/20 text-red-200 border border-red-900/50' 
                            : 'text-gray-200'}
                    `}>
                       {msg.role === Role.USER && msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex gap-2 mb-3 flex-wrap justify-end">
                          {msg.attachments.map((att, idx) => (
                            <img key={idx} src={`data:${att.mimeType};base64,${att.data}`} alt="attachment" className="max-w-full w-48 h-auto object-cover rounded-lg border border-gray-600" />
                          ))}
                        </div>
                      )}
                      
                      <TypewriterText content={msg.text} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex w-full justify-start animate-fadeIn mb-6">
              <div className="flex max-w-[80%] gap-4">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center shadow-lg border border-white/10">
                    <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                 </div>
                 <div className="flex items-center space-x-1 h-8">
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                 </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-gray-950 via-gray-950/90 to-transparent z-20">
        <div className="max-w-3xl mx-auto">
          {/* Preview */}
          {attachments.length > 0 && (
            <div className="flex gap-3 mb-3 overflow-x-auto py-2">
              {attachments.map((att, idx) => (
                <div key={idx} className="relative group shrink-0">
                  <img src={`data:${att.mimeType};base64,${att.data}`} className="h-14 w-14 object-cover rounded-lg border border-gray-700 shadow-md" alt="preview" />
                  <button 
                    onClick={() => removeAttachment(idx)}
                    className="absolute -top-1.5 -right-1.5 bg-gray-800 text-gray-400 rounded-full p-0.5 hover:text-red-500 border border-gray-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700 rounded-2xl p-2 shadow-2xl ring-1 ring-white/5 relative flex items-end gap-2 transition-all duration-300 focus-within:bg-gray-800 focus-within:border-gray-600">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all h-[48px] w-[48px] flex items-center justify-center"
              title="Add Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="image/*" 
                className="hidden" 
              />
            </button>

            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 text-base py-3 px-1 focus:outline-none resize-none max-h-[150px] min-h-[48px]"
              rows={1}
            />

            <button 
              onClick={handleSend}
              disabled={isLoading || (!inputText.trim() && attachments.length === 0)}
              className={`
                p-2 m-1 rounded-xl transition-all duration-200 h-[40px] w-[40px] flex items-center justify-center
                ${(inputText.trim() || attachments.length > 0) && !isLoading
                  ? 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-500/25' 
                  : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'}
              `}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-600 mt-2 font-medium">
             AkinAI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;