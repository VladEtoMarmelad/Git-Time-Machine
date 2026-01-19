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
  javascript: [/from\s+['"]([^'"]+)['"]/, /import\s+['"]([^'"]+)['"]/],
  typescript: [/from\s+['"]([^'"]+)['"]/, /import\s+['"]([^'"]+)['"]/],
  python: [
    /from\s+([a-zA-Z0-9_.]+)\s+import/,
    /import\s+([a-zA-Z0-9_.]+)/
  ],
  java: [/import\s+(?:static\s+)?([a-zA-Z0-9_.]+);/], 
  go: [/import\s+\(?\s*['"]([^'"]+)['"]/],
};

const normalizeLanguagePath = (importPath: string, language: string): string => {
  if (language === 'python') {
    const leadingDotsMatch = importPath.match(/^(\.+)(.*)$/);
    if (leadingDotsMatch) {
      const dots = leadingDotsMatch[1];
      const rest = leadingDotsMatch[2];
      const prefix = dots.length === 1 ? './' : '../'.repeat(dots.length - 1);
      return prefix + rest.replace(/\./g, '/');
    }
    return importPath.replace(/\./g, '/');
  }

  if (language === 'java') {
    // In Java, we always replace dots with slashes
    return importPath.replace(/\./g, '/');
  }

  return importPath;
};

export const createSyntaxHighlighter = ({
  language,
  currentFilePath,
  allExistingPaths,
  setChosenFilePath
}: RenderSyntaxOptions) => {
  return (str: string) => {
    let rawImportPath: string | null = null;

    const patterns = IMPORT_PATTERNS[language] || [];
    for (const pattern of patterns) {
      const match = str.match(pattern);
      if (match) {
        rawImportPath = match[1];
        break;
      }
    }

    if (!rawImportPath) {
      return (
        <SyntaxHighlighter language={language} style={vscDarkPlus} customStyle={{ margin: 0, padding: 0, background: 'transparent' }}>
          {str || " "}
        </SyntaxHighlighter>
      );
    }

    // 1. Normalize the path depending on the language
    const normalizedPath = normalizeLanguagePath(rawImportPath, language);
    
    // 2. Resolve relative path (convert ../ into an absolute path within the project)
    const basePath = resolveRelativePath(currentFilePath, normalizedPath);
    
    // 3. Search for the file on disk, taking extensions into account
    const actualPath = findActualPath(basePath, allExistingPaths);

    const isProjectFile = !!actualPath;

    const handleLineClick = () => {
      if (isProjectFile && actualPath) {
        setChosenFilePath(actualPath);
      }
    };

    return (
      <div 
        onClick={handleLineClick}
        className={`flex items-center w-full transition-all duration-200 group/line 
          ${isProjectFile ? 'cursor-pointer hover:bg-[#23863622]' : 'hover:bg-[#88888811]'}`}
      >
        <div className="flex-1">
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{ margin: 0, padding: 0, background: 'transparent', pointerEvents: 'none' }}
            showLineNumbers={false}
            wrapLines={true}
          >
            {str || " "} 
          </SyntaxHighlighter>
        </div>
        {isProjectFile && (
          <span className="opacity-0 group-hover/line:opacity-100 transition-opacity ml-2 text-[10px] text-[#3fb950] italic shrink-0 pr-2">
            follow import
          </span>
        )}
      </div>
    );
  };
};