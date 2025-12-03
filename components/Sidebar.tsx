import React from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat,
  isOpen,
  onClose
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
        
        {/* Header */}
        <div className="p-4 pt-6">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-900 hover:bg-gray-800 text-gray-200 rounded-xl transition-all duration-200 border border-gray-800 hover:border-gray-700 shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-md bg-gray-800 group-hover:bg-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                  <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium text-sm tracking-wide">New Chat</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
          <div className="text-xs font-bold text-gray-600 px-4 mb-3 uppercase tracking-widest">Your Chats</div>
          {sessions.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-600">No chats yet.</p>
              <p className="text-xs text-gray-700 mt-1">Start a new conversation!</p>
            </div>
          )}
          <div className="space-y-1">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  onSelectSession(session.id);
                  if (window.innerWidth < 768) onClose();
                }}
                className={`
                  w-full text-left px-4 py-3 rounded-lg text-sm truncate transition-all duration-200 flex items-center gap-3 group relative
                  ${session.id === currentSessionId 
                    ? 'bg-gray-800 text-white font-medium border border-gray-700/50' 
                    : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200 border border-transparent'}
                `}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 min-w-[16px] transition-colors ${session.id === currentSessionId ? 'text-primary-400' : 'text-gray-600 group-hover:text-gray-400'}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                <span className="truncate pr-4">{session.title}</span>
                {session.id === currentSessionId && (
                   <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Creator Info */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/50">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-900 transition-colors cursor-default">
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