import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { resolveRelativePath } from '@/utils/resolveRelativePath';
import { findActualPath } from '@/utils/findActualPath';

interface RenderSyntaxOptions {
  language: string;
  currentFilePath: string;
  allExistingPaths: Set<string>;
  setChosenFilePath: (filePath: string | null) => void;
}

// A factory that returns a function for rendering content in ReactDiffViewer
export const createSyntaxHighlighter = ({
  language,
  currentFilePath,
  allExistingPaths,
  setChosenFilePath
}: RenderSyntaxOptions) => {
  return (str: string) => {
    const importMatch = str.match(/(?:from|import)\s+['"]([^'"]+)['"]/);
    const importPath = importMatch ? importMatch[1] : null;
    const isImport = !!importPath;

    const handleLineClick = () => {
      if (isImport && importPath) {
        const basePath = resolveRelativePath(currentFilePath, importPath);
        const actualPath = findActualPath(basePath, allExistingPaths);
          
        if (actualPath) {
          setChosenFilePath(actualPath);
        } else {
          console.warn('Could not resolve path:', basePath);
        }
      }
    };

    return (
      <div 
        onClick={handleLineClick}
        className={`
          flex items-center w-full transition-all duration-200 
          ${isImport ? 'cursor-pointer hover:bg-[#23863622] active:bg-[#23863644] group/line' : ''}
        `}
      >
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: 0, background: 'transparent', flex: 1, pointerEvents: 'none' }}
          showLineNumbers={false}
          wrapLines={true}
        >
          {str || " "} 
        </SyntaxHighlighter>
          
        {isImport && (
          <span className="opacity-0 group-hover/line:opacity-50 ml-2 text-[10px] text-[#3fb950] italic shrink-0">
            follow import
          </span>
        )}
      </div>
    );
  };
};