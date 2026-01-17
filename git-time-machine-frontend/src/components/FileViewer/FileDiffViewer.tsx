import { useMemo } from 'react';
import { File } from "@sharedTypes/index";
import { FileTreeItem } from '@/types/FileTreeItem';
import { flattenFileTree } from '@/utils/flattenFileTree';
import { createSyntaxHighlighter } from './createSyntaxHighlighter';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import * as diff from 'diff';

interface FileDiffViewerProps {
  language: string;
  fileTree: FileTreeItem[];
  fileContent: File;
  setChosenFilePath: (filePath: string | null) => void;
}

export const FileDiffViewer = ({ fileTree, language, fileContent, setChosenFilePath }: FileDiffViewerProps) => {
  const oldCode = fileContent.previousContent || "";
  const newCode = fileContent.content || "";
  
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
  const allExistingPaths = useMemo(() => flattenFileTree(fileTree), [fileTree]);

  // Creating a Rendering Function via a Factory with Memoization
  const renderContent = useMemo(() => {
    return createSyntaxHighlighter({
      language,
      currentFilePath: fileContent.path,
      allExistingPaths,
      setChosenFilePath
    });
  }, [language, fileContent.path, allExistingPaths, setChosenFilePath]);

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

  return (
    <div className="font-mono flex flex-col border border-[#30363d] rounded-md overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-2 border-b border-[#30363d] bg-[#0d1117] text-xs font-sans">
        <div className="flex items-center gap-1">
          <span className="text-[#3fb950] font-semibold">+{added}</span>
          <span className="text-[#f85149] font-semibold">-{removed}</span>
          <span className="ml-1 text-[#8b949e]">
            {added + removed} lines changed
          </span>
        </div>
        <div className="text-[#8b949e] truncate max-w-md">
          {fileContent.path}
        </div>
      </div>

      <ReactDiffViewer
        oldValue={oldCode}
        newValue={newCode}
        splitView={false}
        compareMethod={DiffMethod.LINES}
        hideLineNumbers={false}
        showDiffOnly={false}
        renderContent={renderContent}
        useDarkTheme={true}
        styles={gitHubDarkThemeStyles}
      />
    </div>
  );
};