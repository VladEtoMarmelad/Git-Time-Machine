import { useState, useEffect } from 'react';
import { JobStatus } from "@/types/JobStatus"
import { File } from "@sharedTypes/index";
import { getLanguageFromFilename } from "@/utils/getLanguageFromFilename"; 
import { MarkdownPreviewToggle } from './MarkdownPreviewToggle';
import { MarkdownRenderer } from './MarkdownRenderer';
import { FileDiffViewer } from './FileDiffViewer';

interface FileViewerProps {
  fileStatus: JobStatus;
  fileError: string | null;
  fileContent: File | null;
  chosenFilePath: string | null
}

export const FileViewer = ({ fileStatus, fileError, fileContent, chosenFilePath }: FileViewerProps) => {
  const language = getLanguageFromFilename(chosenFilePath);
  const [viewMode, setViewMode] = useState<"diff"|"preview">("diff");

  useEffect(() => {
    setViewMode("diff");
  }, [chosenFilePath]);

  const isMarkdown = language === "markdown";
  const showContent = fileStatus !== "processing" && fileStatus !== "failed" && fileContent?.content;

  return (
    <section style={{ scrollbarColor: 'gray #010409', scrollbarWidth: 'thin' }}>
      <h2 className="text-lg font-semibold mb-2">File review</h2>
      
      <section className="bg-[#010409] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] h-[52.5vh] overflow-hidden flex flex-col">
        
        {fileStatus === "processing" && <div className="p-4">Loading file content...</div>}
        {fileStatus === "failed" && <div className="p-4 text-red-500">{fileError}</div>}
        {fileStatus === "idle" && !chosenFilePath && <div className="p-4">Select a file to view its content.</div>}

        {showContent && (
          <>
            {/* Header: show only if Markdown */}
            <MarkdownPreviewToggle 
              isMarkdown={isMarkdown}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />

            <div 
              className="h-full overflow-auto font-sans" // font-sans makes reading text easier
              style={{ scrollbarColor: 'gray #010409', scrollbarWidth: 'thin' }}
            >
              {viewMode === 'preview' ? 
                // --- PREVIEW MODE ---
                <MarkdownRenderer fileText={fileContent.content}/>
              : 
                // --- CODE MODE (DIFF) ---
                <FileDiffViewer 
                  language={language}
                  fileContent={fileContent}
                />
              }
            </div>
          </>
        )}
      </section>
    </section>
  )
}