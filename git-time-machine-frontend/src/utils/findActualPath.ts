const POSSIBLE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json'];

// Trying to find an existing file in the tree by iterating through extensions
export const findActualPath = (resolvedPath: string, allPaths: Set<string>): string | null => {
  // 1. Check for an exact match (if the extension already exists)
  if (allPaths.has(resolvedPath)) return resolvedPath;

  // 2. Checking extensions: file.ts, file.tsx...
  for (const ext of POSSIBLE_EXTENSIONS) {
    const pathWithExt = `${resolvedPath}${ext}`;
    if (allPaths.has(pathWithExt)) return pathWithExt;
  }

  // 3. Checking index files: folder/index.ts, folder/index.tsx...
  for (const ext of POSSIBLE_EXTENSIONS) {
    const indexPath = `${resolvedPath}/index${ext}`;
    if (allPaths.has(indexPath)) return indexPath;
  }

  return null;
};