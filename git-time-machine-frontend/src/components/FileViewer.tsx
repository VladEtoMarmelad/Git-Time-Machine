import { JobStatus } from "@/types/JobStatus"
import { File } from "@sharedTypes/File";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getLanguageFromFilename } from "@/utils/getLanguageFromFilename"; 

interface FileViewerProps {
  fileStatus: JobStatus;
  fileError: string|null;
  fileContent: File|null;
  chosenFilePath: string|null
}

export const FileViewer = ({fileStatus, fileError, fileContent, chosenFilePath}: FileViewerProps) => {
  // Determine the language based on the selected path
  const language = getLanguageFromFilename(chosenFilePath);

  const customStyle = {
    margin: 0,
    padding: '1rem',
    background: 'transparent',
    fontSize: '0.875rem', 
    lineHeight: '1.5',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  };

  return (
    <section style={{ scrollbarColor: 'gray #010409', scrollbarWidth: 'thin' }}>
      <h2 className="text-lg font-semibold mb-2">File review</h2>
      <div className="bg-[#010409] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] h-[60vh]">
        <pre className="whitespace-pre-wrap break-words h-[60vh] overflow-auto font-mono">
          {fileStatus === "processing" && "Loading file content..."}
          {fileStatus === "failed" && <span className="text-red-500">{fileError}</span>}
          {fileStatus === "idle" && !chosenFilePath && "Select a file to view its content."}
          {fileStatus !== "processing" && fileStatus !== "failed" && fileContent?.content && 
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              showLineNumbers={true} 
              wrapLines={true}       
              customStyle={customStyle}
              lineNumberStyle={{
                minWidth: '3em',
                paddingRight: '1em',
                textAlign: 'right',
                userSelect: 'none'
              }}
            >
              {fileContent.content}
            </SyntaxHighlighter>
          }
        </pre>
      </div>
    </section>
  )
}