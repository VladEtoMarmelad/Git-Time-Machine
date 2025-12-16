import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- GitHub Dark Markdown Styling ---
// Tailwind resets styles, so we restore them manually
export const MarkdownComponents = {
  // Headings with bottom borders (like in README)
  h1: ({node, ...props}: any) => <h1 className="text-3xl font-semibold border-b border-[#30363d] pb-2 mb-4 mt-6 text-[#c9d1d9]" {...props} />,
  h2: ({node, ...props}: any) => <h2 className="text-2xl font-semibold border-b border-[#30363d] pb-2 mb-3 mt-5 text-[#c9d1d9]" {...props} />,
  h3: ({node, ...props}: any) => <h3 className="text-xl font-semibold mb-2 mt-4 text-[#c9d1d9]" {...props} />,
  h4: ({node, ...props}: any) => <h4 className="text-base font-semibold mb-2 mt-4 text-[#c9d1d9]" {...props} />,
  
  // Text and paragraphs
  p: ({node, ...props}: any) => <p className="mb-4 leading-7 text-[#c9d1d9]" {...props} />,
  
  // Lists (Tailwind removes bullets, we restore them)
  ul: ({node, ...props}: any) => <ul className="list-disc pl-6 mb-4 text-[#c9d1d9]" {...props} />,
  ol: ({node, ...props}: any) => <ol className="list-decimal pl-6 mb-4 text-[#c9d1d9]" {...props} />,
  li: ({node, ...props}: any) => <li className="mb-1" {...props} />,
  
  // Links
  a: ({node, ...props}: any) => <a className="text-[#58a6ff] hover:underline no-underline" target="_blank" rel="noopener noreferrer" {...props} />,
  
  // Blockquotes
  blockquote: ({node, ...props}: any) => <blockquote className="border-l-4 border-[#30363d] pl-4 text-[#8b949e] italic mb-4" {...props} />,
  
  // Code elements (`code`)
  code: ({node, inline, className, children, ...props}: any) => {
    // If it's a code block (```), use SyntaxHighlighter
    const match = /language-(\w+)/.exec(className || '');
    if (!inline && match) {
       return (
         <div className="rounded-md overflow-hidden my-4 border border-[#30363d]">
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              customStyle={{ margin: 0, padding: '1rem', background: '#0d1117' }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
         </div>
       );
    }
    // If it's inline code (`variable`)
    return (
      <code className="bg-[rgba(110,118,129,0.4)] rounded-md px-[0.4em] py-[0.2em] text-[85%] font-mono text-[#c9d1d9]" {...props}>
        {children}
      </code>
    );
  },

  // Tables
  table: ({node, ...props}: any) => <div className="overflow-auto mb-4"><table className="w-full text-left border-collapse" {...props} /></div>,
  th: ({node, ...props}: any) => <th className="border border-[#30363d] px-3 py-2 bg-[#161b22] font-semibold" {...props} />,
  td: ({node, ...props}: any) => <td className="border border-[#30363d] px-3 py-2" {...props} />,
  
  // Horizontal rule
  hr: ({node, ...props}: any) => <hr className="border-t border-[#30363d] my-6" {...props} />,
};