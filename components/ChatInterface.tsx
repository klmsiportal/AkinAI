import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, Role, Attachment } from '../types';
import TypewriterText from './TypewriterText';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (text: string, attachments: Attachment[]) => void;
  onToggleSidebar: () => void;
  onRecordAudio: () => Promise<void>;
  isRecording: boolean;
}

const SUGGESTIONS = [
  { icon: '💻', text: 'Write a Python script', sub: 'to scrape stock prices' },
  { icon: '🎨', text: 'Generate an image', sub: 'of a futuristic city' },
  { icon: '🧠', text: 'Explain Quantum Physics', sub: 'like I am five' },
  { icon: '📝', text: 'Draft an email', sub: 'requesting a vacation' },
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  isLoading, 
  onSend, 
  onToggleSidebar,
  onRecordAudio,
  isRecording
}) => {
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
                 <div className="relative w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center border border-gray-800 shadow-2xl">
                    <span className="text-4xl">🧬</span>
                 </div>
              </div>
              
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 mb-3">Hello, I'm AkinAI</h1>
              <p className="text-gray-400 max-w-md text-lg leading-relaxed mb-10">
                Advanced intelligence for coding, vision, and creativity.
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
                  flex max-w-[95%] md:max-w-[85%] 
                  ${msg.role === Role.USER ? 'flex-row-reverse' : 'flex-row'}
                  gap-4
                `}>
                  {/* Avatar */}
                  <div className="flex-shrink-0 mt-1 hidden md:block">
                    {msg.role === Role.MODEL ? (
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border border-white/10 ${msg.isError ? 'bg-red-900/50' : 'bg-gradient-to-tr from-primary-600 to-indigo-600'}`}>
                          <span className="text-xs font-bold text-white">AI</span>
                       </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600">
                        <span className="text-xs font-bold text-gray-300">U</span>
                      </div>
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={`
                    flex flex-col min-w-0
                    ${msg.role === Role.USER ? 'items-end' : 'items-start'}
                  `}>
                    <div className={`
                      px-5 py-3 rounded-2xl shadow-sm text-sm leading-6 md:text-base md:leading-7 overflow-hidden
                      ${msg.role === Role.USER 
                        ? 'bg-gray-800 text-white rounded-tr-sm border border-gray-700' 
                        : msg.isError 
                            ? 'bg-red-950/40 text-red-200 border border-red-900/50' 
                            : 'text-gray-200'}
                    `}>
                       {/* Attachments Display */}
                       {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex gap-2 mb-3 flex-wrap justify-end">
                          {msg.attachments.map((att, idx) => {
                            if (att.type === 'image') {
                                return <img key={idx} src={`data:${att.mimeType};base64,${att.data}`} alt="attachment" className="max-w-full w-64 h-auto object-cover rounded-lg border border-gray-600" />
                            }
                            return null;
                          })}
                        </div>
                      )}

                      {/* Generated Image Type */}
                      {msg.type === 'image_generation' && msg.attachments?.[0] && (
                          <div className="mb-2">
                             <img src={`data:image/png;base64,${msg.attachments[0].data}`} className="rounded-lg shadow-lg border border-gray-700 w-full max-w-md" alt="Generated" />
                             <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-primary-400"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                                Generated with Gemini 3 Pro
                             </div>
                          </div>
                      )}
                      
                      <TypewriterText content={msg.text} />

                      {/* Audio Player for TTS */}
                      {msg.type === 'audio_generation' && msg.attachments?.[0] && (
                        <div className="mt-3 bg-gray-900/50 rounded-lg p-2 border border-gray-700 flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center text-primary-400">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                                    <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                                </svg>
                             </div>
                             <audio controls src={`data:audio/mp3;base64,${msg.attachments[0].data}`} className="h-8 w-48 md:w-64" />
                        </div>
                      )}
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
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center shadow-lg border border-white/10 hidden md:flex">
                    <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                 </div>
                 <div className="flex items-center space-x-1 h-8 px-4">
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></span>
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse delay-75"></span>
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse delay-150"></span>
                    <span className="text-xs text-gray-500 ml-2 animate-pulse">Thinking...</span>
                 </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-gray-950 via-gray-950/95 to-transparent z-20">
        <div className="max-w-3xl mx-auto">
          {/* Preview */}
          {attachments.length > 0 && (
            <div className="flex gap-3 mb-3 overflow-x-auto py-2">
              {attachments.map((att, idx) => (
                <div key={idx} className="relative group shrink-0">
                  <img src={`data:${att.mimeType};base64,${att.data}`} className="h-16 w-16 object-cover rounded-lg border border-gray-700 shadow-md" alt="preview" />
                  <button 
                    onClick={() => removeAttachment(idx)}
                    className="absolute -top-2 -right-2 bg-gray-800 text-gray-400 rounded-full p-1 hover:text-red-500 border border-gray-600 transition-colors shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700 rounded-2xl p-2 shadow-2xl ring-1 ring-white/5 relative flex items-end gap-2 transition-all duration-300 focus-within:bg-gray-800 focus-within:border-gray-500">
            {/* Attachment Button */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all h-[48px] w-[48px] flex items-center justify-center shrink-0"
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

            {/* Mic Button */}
            <button
                onClick={onRecordAudio}
                className={`p-3 rounded-xl transition-all h-[48px] w-[48px] flex items-center justify-center shrink-0 ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                title="Voice Input"
            >
                {isRecording ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                         <path d="M12 2c.553 0 1 .448 1 1v18c0 .552-.447 1-1 1s-1-.448-1-1V3c0-.552.447-1 1-1z" />
                         <path d="M15 5c.553 0 1 .448 1 1v12c0 .552-.447 1-1 1s-1-.448-1-1V6c0-.552.447-1 1-1z" />
                         <path d="M9 5c.553 0 1 .448 1 1v12c0 .552-.447 1-1 1s-1-.448-1-1V6c0-.552.447-1 1-1z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                )}
            </button>

            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Listening..." : "Ask anything... (Type 'draw a cat' to generate images)"}
              className="flex-1 bg-transparent text-white placeholder-gray-500 text-base py-3 px-1 focus:outline-none resize-none max-h-[150px] min-h-[48px]"
              rows={1}
            />

            <button 
              onClick={handleSend}
              disabled={isLoading || (!inputText.trim() && attachments.length === 0)}
              className={`
                p-2 m-1 rounded-xl transition-all duration-200 h-[40px] w-[40px] flex items-center justify-center shrink-0
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
             AkinAI (Pro) • Powered by Gemini 3.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
