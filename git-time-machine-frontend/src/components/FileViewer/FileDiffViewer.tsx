import { useMemo } from 'react';
import { File } from "@sharedTypes/index";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import * as diff from 'diff'; 

interface FileDiffViewerProps {
  language: string;
  fileContent: File;
}

export const FileDiffViewer = ({ language, fileContent }: FileDiffViewerProps) => {
  const oldCode = fileContent.previousContent || "";
  const newCode = fileContent.content || "";

  // Counting the number of added and deleted rows
  const { added, removed } = useMemo(() => {
    const changes = diff.diffLines(oldCode, newCode);
    return changes.reduce(
      (acc, change) => {
        if (change.added) acc.added += change.count || 0;
        if (change.removed) acc.removed += change.count || 0;
        return acc;
      },
      { added: 0, removed: 0 }
    );
  }, [oldCode, newCode]);

  const gitHubDarkThemeStyles = {
    variables: {
      dark: {
        diffViewerBackground: '#010409',
        diffViewerColor: '#c9d1d9',
        addedBackground: '#052d18',
        addedColor: '#c9d1d9',
        removedBackground: '#361115',
        removedColor: '#c9d1d9',
        wordAddedBackground: '#1b5c2d',
        wordRemovedBackground: '#751a23',
        addedGutterBackground: '#010409',
        removedGutterBackground: '#010409',
        gutterBackground: '#010409',
        gutterBackgroundDark: '#010409',
        highlightBackground: '#010409',
        highlightGutterBackground: '#010409'
      }
    },
    line: {
      padding: '1px 2px',
      '&:hover': {
        background: 'transparent'
      }
    }
  };

  const highlightSyntax = (str: string) => (
    <SyntaxHighlighter
      language={language}
      style={vscDarkPlus}
      customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
      lineNumberStyle={{ display: 'none' }}
      showLineNumbers={false}
      wrapLines={true}
    >
      {str}
    </SyntaxHighlighter>
  );

  return (
    <div className="font-mono flex flex-col">
      {/* Status bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-[#30363d] bg-[#0d1117] text-xs font-sans">
        <div className="flex items-center gap-1">
          <span className="text-[#3fb950] font-semibold">+{added}</span>
          <span className="text-[#f85149] font-semibold">-{removed}</span>
          <span className="ml-1 text-[#8b949e]">
            {added + removed} lines changed
          </span>
        </div>
      </div>

      <ReactDiffViewer
        oldValue={oldCode}
        newValue={newCode}
        splitView={false}
        compareMethod={DiffMethod.LINES}
        hideLineNumbers={false}
        showDiffOnly={false}
        renderContent={highlightSyntax}
        useDarkTheme={true}
        styles={gitHubDarkThemeStyles}
      />
    </div>
  );
};