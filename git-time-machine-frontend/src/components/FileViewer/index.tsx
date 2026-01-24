import { useState, useEffect } from 'react';
import { JobStatus } from "@/types/JobStatus"
import { File, FileDisplayHint } from "@sharedTypes/index";
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
  const [isForceShow, setIsForceShow] = useState(false); // State for forced display (used for collapsed files)

  // Reset the view mode and force-show flag when the selected file changes
  useEffect(() => {
    setViewMode("diff");
    setIsForceShow(false);
  }, [chosenFilePath]);

  const isMarkdown = language === "markdown";

  // Logic for determining content (extended version of renderContent)
  const renderMainContent = () => {
    if (fileStatus === "processing") {
      return <div className="p-4 text-[#8b949e] animate-pulse">Loading file content...</div>;
    }

    if (fileStatus === "failed") {
      return (
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <p className="text-red-500 font-medium">{fileError || "Failed to load file"}</p>
        </div>
      );
    }

    if (fileStatus === "idle" && !chosenFilePath) {
      return (
        <div className="h-full flex items-center justify-center text-[#8b949e]">
          <p>Select a file to view its content.</p>
        </div>
      );
    }

    if (!fileContent) return null;

    const hint: FileDisplayHint | undefined = fileContent?.displayHint;

    // 1. Hidden files
    if (hint === 'hidden') {
      return (
        <div className="p-8 flex flex-col items-center justify-center text-[#8b949e] bg-[#0d1117]">
          <p>This file is hidden and cannot be previewed.</p>
        </div>
      );
    }

    // 2. Binary files
    if (hint === 'binary') {
      return (
        <div className="p-8 flex flex-col items-center justify-center text-[#8b949e] bg-[#0d1117] h-full">
          <p>This is a binary file. Optimized preview is not available.</p>
        </div>
      );
    }

    // 3. Collapsed (large) files
    if (hint === 'collapsed' && !isForceShow) {
      return (
        <div className="p-8 flex flex-col items-center justify-center bg-[#0d1117] h-full">
          <p className="text-[#8b949e] mb-4">This file is suppressed from being displayed by default (it might be too large).</p>
          <button 
            onClick={() => setIsForceShow(true)}
            className="px-4 py-1.5 bg-[#21262d] border border-[#30363d] rounded-md text-[#58a6ff] hover:bg-[#30363d] transition-colors text-sm font-medium"
          >
            Show file content
          </button>
        </div>
      );
    }

    // 4. Normal mode or forced display (showContent)
    return (
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
    );
  };

  return (
    <section style={{ scrollbarColor: 'gray #010409', scrollbarWidth: 'thin' }}>
      <h2 className="text-lg font-semibold mb-2">File review</h2>
      
      <section className="bg-[#010409] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] h-[52.5vh] overflow-hidden flex flex-col">
        
        {/* Header: show only if a file is selected */}
        {chosenFilePath && (
          <>
            <MarkdownPreviewToggle 
              isMarkdown={isMarkdown}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />

            {/* Selected file info bar */}
            <section className="flex items-center gap-4 px-4 py-2 border-b border-[#30363d] bg-[#0d1117] text-xs font-sans">
              <div className="flex items-center gap-1">
                <span className="ml-1 text-[#8b949e]">
                  {fileContent?.path || chosenFilePath}
                </span>
              </div>
              {/* Badge for collapsed files */}
              {fileContent?.displayHint === 'collapsed' && isForceShow && (
                <span className="text-[10px] bg-[#30363d] px-1.5 py-0.5 rounded text-[#8b949e]">
                  Large File
                </span>
              )}
            </section>
          </>
        )}

        {/* Main content area */}
        <div className="flex-1 overflow-hidden relative">
          {renderMainContent()}
        </div>

      </section>
    </section>
  )
}