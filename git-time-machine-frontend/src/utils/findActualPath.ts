const POSSIBLE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.py', '.java', '.go'];

export const findActualPath = (resolvedPath: string, allPaths: Set<string>): string | null => {
  // 1. Direct match (e.g., for JS/TS relative paths)
  if (allPaths.has(resolvedPath)) return resolvedPath;

  // 2. Check with extensions
  for (const ext of POSSIBLE_EXTENSIONS) {
    const withExt = `${resolvedPath}${ext}`;
    if (allPaths.has(withExt)) return withExt;
  }

  // 3. Special logic for Java/Python (Absolute Package Imports)
  // If the path doesn't start with ./ or ../, it is treated as a path from the source root.
  // We look for a file in the tree that ends with this specific path.
  if (!resolvedPath.startsWith('.')) {
    const normalizedTarget = resolvedPath.startsWith('/') ? resolvedPath : `/${resolvedPath}`;
    
    for (const existingPath of allPaths) {
      for (const ext of POSSIBLE_EXTENSIONS) {
        if (existingPath.endsWith(`${normalizedTarget}${ext}`)) {
          return existingPath;
        }
      }
    }
  }

  // 4. Check for index files (e.g., index.ts, __init__.py)
  const indexFiles = ['index', '__init__'];
  for (const indexName of indexFiles) {
    for (const ext of POSSIBLE_EXTENSIONS) {
      const indexPath = `${resolvedPath}/${indexName}${ext}`;
      if (allPaths.has(indexPath)) return indexPath;
    }
  }

  return null;
};