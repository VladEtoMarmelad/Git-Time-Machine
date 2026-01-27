"use client"

import { useState, useMemo } from "react";
import { FIleTreeItem } from "@/components/FileTree/FileTreeItem";
import { FileTreeItem as FileTreeItemType } from "@/types/FileTreeItem";
import { SearchInput } from "../SearchInput";

interface FileTreeProps {
  fileTreeItems: FileTreeItemType[];
  choosedFile: string | null;
  loadingFileTree: boolean;
  onSelect: (p: string) => void;
}

export const FileTree = ({ fileTreeItems, choosedFile, loadingFileTree, onSelect }: FileTreeProps) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Helper to flatten tree for searching
  const flatFiles = useMemo(() => {
    const files: FileTreeItemType[] = [];
    const recurse = (items: FileTreeItemType[]) => {
      items.forEach(item => {
        if (item.isFile) files.push(item);
        if (item.children) recurse(item.children);
      });
    };
    recurse(fileTreeItems);
    return files;
  }, [fileTreeItems]);

  const toggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  const showSkeleton = loadingFileTree || fileTreeItems.length === 0;

  return (
    <aside className="bg-[#0d1117] text-[#c9d1d9] w-80 h-screen overflow-auto border-r border-[#30363d] p-3 flex flex-col" style={{ scrollbarWidth: 'thin' }}>
      <div className="text-xs font-semibold text-[#8b949e] mb-4 uppercase tracking-wider">Explorer</div>
      
      {/* File Search - Pops DOWN */}
      <div className="mb-4">
        <SearchInput
          items={flatFiles}
          dropdownDirection="down"
          placeholder="Go to file..."
          onSelect={(file) => onSelect(file.path)}
          filterFn={(file, query) => file.name.toLowerCase().includes(query.toLowerCase())}
          renderItem={(file) => (
            <div className="flex flex-col">
              <div className="text-sm font-medium flex items-center">
                <i className="bi bi-file-earmark-code mr-2 opacity-70" />
                {file.name}
              </div>
              <div className="text-[10px] opacity-50 truncate group-hover:text-blue-100">
                {file.path}
              </div>
            </div>
          )}
        />
      </div>

      <div className="flex-1">
        {showSkeleton ? (
          <div className="space-y-2 animate-pulse">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-1">
                <div className="w-4 h-4 bg-[#21262d] rounded-sm flex-shrink-0" />
                <div className="h-3 bg-[#21262d] rounded-sm" style={{ width: `${Math.floor(Math.random() * 40 + 40)}%` }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {fileTreeItems.map((item) => (
              <FIleTreeItem
                key={item.path}
                fileTreeItem={item}
                level={0}
                expanded={expanded}
                toggle={toggle}
                choosedFile={choosedFile}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};