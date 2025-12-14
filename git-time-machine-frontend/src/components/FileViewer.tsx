import { JobStatus } from "@/types/JobStatus"
import { File } from "@sharedTypes/File";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getLanguageFromFilename } from "@/utils/getLanguageFromFilename"; 
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';

interface FileViewerProps {
  fileStatus: JobStatus;
  fileError: string | null;
  fileContent: File | null; // Ensure File now includes the previousContent field
  chosenFilePath: string | null
}

// Extracted styles variable
const gitHubDarkThemeStyles = {
  variables: {
    dark: {
      diffViewerBackground: '#0d1117', // GitHub Dark background color
      diffViewerColor: '#c9d1d9',
      addedBackground: '#052d18',      // Greenish background for additions
      addedColor: '#c9d1d9',
      removedBackground: '#361115',    // Reddish background for deletions
      removedColor: '#c9d1d9',
      wordAddedBackground: '#1b5c2d',
      wordRemovedBackground: '#751a23',
      addedGutterBackground: '#0d1117',
      removedGutterBackground: '#0d1117',
      gutterBackground: '#0d1117',
      gutterBackgroundDark: '#0d1117',
      highlightBackground: '#1e242e',
      highlightGutterBackground: '#1e242e',
    }
  },
  line: {
    padding: '1px 2px',
    '&:hover': {
      background: 'transparent',
    },
  }
};

export const FileViewer = ({ fileStatus, fileError, fileContent, chosenFilePath }: FileViewerProps) => {
  const language = getLanguageFromFilename(chosenFilePath);

  // Function to render code with syntax highlighting inside DiffViewer
  const highlightSyntax = (str: string) => (
    <SyntaxHighlighter
      language={language}
      style={vscDarkPlus}
      // Remove extra padding/margin as DiffViewer manages the layout
      customStyle={{ margin: 0, padding: 0, background: 'transparent' }} 
      lineNumberStyle={{ display: 'none' }} // Line numbers are handled by DiffViewer itself
      showLineNumbers={false}
      wrapLines={true}
    >
      {str}
    </SyntaxHighlighter>
  );

  return (
    <section style={{ scrollbarColor: 'gray #010409', scrollbarWidth: 'thin' }}>
      <h2 className="text-lg font-semibold mb-2">File review</h2>
      <section className="bg-[#010409] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] h-[52.5vh] overflow-hidden flex flex-col">
        
        {/* Handling loading/error states */}
        {fileStatus === "processing" && <div className="p-4">Loading file content...</div>}
        {fileStatus === "failed" && <div className="p-4 text-red-500">{fileError}</div>}
        {fileStatus === "idle" && !chosenFilePath && <div className="p-4">Select a file to view its content.</div>}

        {/* Content rendering */}
        {fileStatus !== "processing" && fileStatus !== "failed" && fileContent?.content && (
          <div 
            className="h-full overflow-auto font-mono"
            style={{ scrollbarColor: 'gray #010409', scrollbarWidth: 'thin' }}
          >
            <ReactDiffViewer
              oldValue={fileContent.previousContent || ""} // Old version (empty string if the file is new)
              newValue={fileContent.content}              // New version
              splitView={false}                           // false = Unified View (like GitHub in single column mode)
              compareMethod={DiffMethod.LINES}
              
              // KEY POINT for your task:
              hideLineNumbers={false}
              showDiffOnly={false} // false = Show the whole file, not just changes
              
              renderContent={highlightSyntax} // Connect your syntax highlighting
              
              // Styling for GitHub Dark Theme
              useDarkTheme={true}
              styles={gitHubDarkThemeStyles}
            />
          </div>
        )}
      </section>
    </section>
  )
}