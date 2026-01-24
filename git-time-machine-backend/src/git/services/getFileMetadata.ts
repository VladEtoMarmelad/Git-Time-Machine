import { FileDisplayHint } from "@sharedTypes/index";

export const getFileMetadata = (filePath: string): FileDisplayHint => {
  const filename = filePath.split('/').pop() || '';
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  // 1. Files that are typically collapsed or very large (lock files)
  const collapsedFiles = [
    'pnpm-lock.yaml',
    'package-lock.json',
    'yarn.lock',
    'composer.lock',
    'go.sum',
    'cargo.lock'
  ];

  // 2. Binary file extensions
  const binaryExtensions = [
    'jpg', 'jpeg', 'png', 'gif', 'ico', 'pdf', 'zip', 'gz', 
    'exe', 'dll', 'so', 'bin', 'woff', 'woff2', 'ttf', 'eot', 
    'svg'
  ];

  // 3. Hidden system files
  if (filename.startsWith('.DS_Store') || filename.startsWith('.git/')) {
    return 'hidden';
  }

  if (collapsedFiles.includes(filename)) {
    return 'collapsed';
  }

  if (binaryExtensions.includes(extension)) {
    return 'binary';
  }

  return 'normal';
}