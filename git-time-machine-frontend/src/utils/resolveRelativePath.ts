export const resolveRelativePath = (currentPath: string, importPath: string): string => {
  // If the import is irrelevant (e.g. an alias @/ or a library),
  // return as is or add your own alias logic
  if (!importPath.startsWith('.')) {
    return importPath;
  }

  const parts = currentPath.split('/');
  parts.pop(); // Remove the name of the current file

  const importParts = importPath.split('/');

  for (const part of importParts) {
    if (part === '.' || part === '') continue;
    if (part === '..') {
      parts.pop();
    } else {
      parts.push(part);
    }
  }

  return parts.join('/');
};