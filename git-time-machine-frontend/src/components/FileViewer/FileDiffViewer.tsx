import { File } from "@sharedTypes/index"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';

interface FileDiffViewerProps {
  language: string;
  fileContent: File
}

export const FileDiffViewer = ({language, fileContent}: FileDiffViewerProps) => {

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
    <div className="font-mono"> 
      <ReactDiffViewer
        oldValue={fileContent.previousContent || ""}
        newValue={fileContent.content}
        splitView={false}
        compareMethod={DiffMethod.LINES}
        hideLineNumbers={false}
        showDiffOnly={false}
        renderContent={highlightSyntax}
        useDarkTheme={true}
        styles={gitHubDarkThemeStyles}
      />
    </div>
  )
}