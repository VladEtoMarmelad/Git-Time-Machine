import { MarkdownComponents } from './MarkdownComponents';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const MarkdownRenderer = ({fileText}: {fileText: string|undefined}) => {
  return (
    <div className="p-8 bg-[#010409] min-h-full">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} // Support for tables, links, strikethrough
        components={MarkdownComponents} // Our custom components/styles
      >
        {fileText}
      </ReactMarkdown>
    </div>
  )
}