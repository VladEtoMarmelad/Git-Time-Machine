import { useState, useEffect } from 'react';
import { JobStatus } from "@/types/JobStatus"
import { File } from "@sharedTypes/index";
import { getLanguageFromFilename } from "@/utils/getLanguageFromFilename"; 
import { MarkdownPreviewToggle } from './MarkdownPreviewToggle';
import { MarkdownRenderer } from './MarkdownRenderer';
import { FileDiffViewer } from './FileDiffViewer';
import { FileTreeItem } from '@/types/FileTreeItem';

interface FileViewerProps {
  fileStatus: JobStatus;
  fileError: string | null;
  fileTree: FileTreeItem[];
  fileContent: File | null;
  chosenFilePath: string | null;
  setChosenFilePath: (filePath: string|null) => void
}

export const FileViewer = ({ fileStatus, fileError, fileTree, fileContent, chosenFilePath, setChosenFilePath }: FileViewerProps) => {
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

            {/* Selected file */}
            <section className="flex items-center gap-4 px-4 py-2 border-b border-[#30363d] bg-[#0d1117] text-xs font-sans">
              <div className="flex items-center gap-1">
                <span className="ml-1 text-[#8b949e]">
                  {fileContent.path}
                </span>
              </div>
            </section>

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
                  fileTree={fileTree}
                  fileContent={fileContent}
                  setChosenFilePath={setChosenFilePath}
                />
              }
            </div>
          </>
        )}
      </section>
    </section>
  )
}