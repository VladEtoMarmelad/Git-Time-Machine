import { FileTreeItem } from "@/types/FileTreeItem";

// Converts a file tree into a flat Set of paths for fast O(1) lookups
export const flattenFileTree = (items: FileTreeItem[], paths: Set<string> = new Set()): Set<string> => {
  items.forEach(item => {
    if (item.path) paths.add(item.path);
    if (item.children) flattenFileTree(item.children, paths);
  });
  return paths;
};