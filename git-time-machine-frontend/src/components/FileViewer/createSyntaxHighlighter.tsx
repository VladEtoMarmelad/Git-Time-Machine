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

const IMPORT_PATTERNS: Record<string, RegExp[]> = {
  // JS/TS: look for content inside quotes after 'from' or 'import'
  javascript: [/from\s+['"]([^'"]+)['"]/, /import\s+['"]([^'"]+)['"]/],
  typescript: [/from\s+['"]([^'"]+)['"]/, /import\s+['"]([^'"]+)['"]/],
  // Python: from module.sub import ... or import module.sub
  python: [
    /from\s+([a-zA-Z0-9_.]+)\s+import/,
    /import\s+([a-zA-Z0-9_.]+)/
  ],
  // Java: import com.package.Class;
  java: [/import\s+([\w.]+);/],
  // Go: import "path/to/mod" or import ( "path" )
  go: [/import\s+\(?\s*['"]([^'"]+)['"]/],
};

export const createSyntaxHighlighter = ({
  language,
  currentFilePath,
  allExistingPaths,
  setChosenFilePath
}: RenderSyntaxOptions) => {
  return (str: string) => {
    let importPath: string | null = null;

    // 1. Try to find the import path using regular expressions
    const patterns = IMPORT_PATTERNS[language] || IMPORT_PATTERNS['javascript'];
    for (const pattern of patterns) {
      const match = str.match(pattern);
      if (match) {
        importPath = match[1];
        break;
      }
    }

    // If it's not an import at all — render a regular string
    if (!importPath) {
      return (
        <SyntaxHighlighter 
          language={language} 
          style={vscDarkPlus} 
          customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
        >
          {str || " "}
        </SyntaxHighlighter>
      );
    }

    // 2. Path normalization for file system lookup
    let normalizedPath = importPath;
    if (language === 'python') {
      // In Python: 'models.utils' -> 'models/utils', but '.utils' -> '../utils'
      if (normalizedPath.startsWith('.')) {
        normalizedPath = normalizedPath.replace(/^\./, './').replace(/\./g, '../');
      } else {
        normalizedPath = normalizedPath.replace(/\./g, '/');
      }
    } else if (language === 'java') {
      normalizedPath = normalizedPath.replace(/\./g, '/');
    }

    // 3. Attempt to match the path with existing project files
    const basePath = resolveRelativePath(currentFilePath, normalizedPath);
    const actualPath = findActualPath(basePath, allExistingPaths);

    // Display flags
    const isProjectFile = !!actualPath;
    const isImport = !!importPath;

    const handleLineClick = () => {
      if (isProjectFile && actualPath) {
        setChosenFilePath(actualPath);
      } else if (isImport) {
        console.warn('File not found in the project (possibly an external library):', basePath);
      }
    };

    return (
      <div 
        onClick={handleLineClick}
        className={`
          flex items-center w-full transition-all duration-200 group/line
          ${isImport ? 'cursor-pointer' : ''}
          ${isProjectFile 
            ? 'hover:bg-[#23863622] active:bg-[#23863644]' 
            : 'hover:bg-[#88888811]'} 
        `}
      >
        <div className="flex-1">
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{ 
              margin: 0, 
              padding: 0, 
              background: 'transparent', 
              pointerEvents: 'none' // Ensure clicks are caught by the parent div
            }}
            showLineNumbers={false}
            wrapLines={true}
          >
            {str || " "} 
          </SyntaxHighlighter>
        </div>
          
        {/* Only show the label if the file is actually found in the project */}
        {isProjectFile && (
          <span className="opacity-0 group-hover/line:opacity-100 transition-opacity ml-2 text-[10px] text-[#3fb950] italic shrink-0 whitespace-nowrap pr-2">
            follow import
          </span>
        )}
        
        {/* Optional hint for external libraries */}
        {(isImport && !isProjectFile) && (
          <span className="opacity-0 group-hover/line:opacity-30 ml-2 text-[10px] text-gray-400 italic shrink-0 whitespace-nowrap pr-2">
            external
          </span>
        )}
      </div>
    );
  };
};