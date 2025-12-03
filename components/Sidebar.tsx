import React from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat,
  isOpen,
  onClose,
  selectedModel,
  onSelectModel
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-[280px] bg-gray-950 border-r border-gray-800 transform transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
        flex flex-col h-full
      `}>
        
        {/* Header with New Chat */}
        <div className="p-4 pt-6 space-y-3">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-between px-4 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all duration-200 shadow-lg shadow-primary-900/20 group"
          >
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-sm tracking-wide">New Chat</span>
            </div>
          </button>

          {/* Model Selector */}
          <div className="relative group">
            <select 
              value={selectedModel}
              onChange={(e) => onSelectModel(e.target.value)}
              className="w-full appearance-none bg-gray-900 border border-gray-800 text-gray-300 text-xs font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors cursor-pointer"
            >
              <option value="gemini-2.5-flash">⚡ Gemini 2.5 Flash (Fast)</option>
              <option value="gemini-3-pro-preview">🧠 Gemini 3 Pro (Smart)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
          <div className="text-[10px] font-bold text-gray-500 px-4 mb-3 uppercase tracking-widest">History</div>
          {sessions.length === 0 && (
            <div className="px-4 py-8 text-center opacity-50">
              <p className="text-sm text-gray-500">No chats yet.</p>
            </div>
          )}
          <div className="space-y-1">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`
                  w-full text-left px-4 py-3 rounded-lg text-sm truncate transition-all duration-200 flex items-center gap-3 group relative
                  ${session.id === currentSessionId 
                    ? 'bg-gray-800/80 text-white font-medium shadow-sm' 
                    : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'}
                `}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 min-w-[16px] transition-colors ${session.id === currentSessionId ? 'text-primary-400' : 'text-gray-600 group-hover:text-gray-400'}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                <span className="truncate pr-4">{session.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Creator Info */}
        <div className="p-4 border-t border-gray-800 bg-gray-950">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-900/50 transition-colors cursor-default">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shadow-inner border border-white/10">
              AS
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-white truncate">Akin S. Sokpah</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Pro Plan • Liberia</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;