import React from 'react';

interface TypewriterTextProps {
  content: string;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ content }) => {
  // A simple parser to handle code blocks (```) and bold text (**)
  // This avoids heavy dependencies like react-markdown for this demo, 
  // but ensures code looks like code.
  
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="leading-relaxed text-gray-200">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Extract language if available
          const firstLineEnd = part.indexOf('\n');
          let language = 'Code';
          let codeContent = part.slice(3, -3);

          if (firstLineEnd > 3) {
            language = part.slice(3, firstLineEnd).trim();
            codeContent = part.slice(firstLineEnd + 1, -3);
          }

          return (
            <div key={index} className="my-4 rounded-md overflow-hidden bg-gray-950 border border-gray-750">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-750">
                <span className="text-xs font-mono text-gray-400 lowercase">{language}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(codeContent)}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Copy
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        } else {
          // Handle bold text and newlines
          const paragraphs = part.split('\n');
          return (
            <span key={index}>
              {paragraphs.map((line, i) => (
                <React.Fragment key={i}>
                  {line.split(/(\*\*.*?\*\*)/g).map((segment, j) => {
                    if (segment.startsWith('**') && segment.endsWith('**')) {
                      return <strong key={j} className="text-white font-semibold">{segment.slice(2, -2)}</strong>;
                    }
                    return <span key={j}>{segment}</span>;
                  })}
                  {i < paragraphs.length - 1 && <br />}
                </React.Fragment>
              ))}
            </span>
          );
        }
      })}
    </div>
  );
};

export default TypewriterText;
