"use client"

import { useState } from "react";
import { FIleTreeItem } from "@/components/FileTree/FileTreeItem";
import { FileTreeItem as FileTreeItemType } from "@/types/FileTreeItem";

interface FileTreeProps {
  fileTreeItems: FileTreeItemType[];
  choosedFile: string | null;
  loadingFileTree: boolean;
  onSelect: (p: string) => void;
}

export const FileTree = ({ fileTreeItems, choosedFile, loadingFileTree, onSelect }: FileTreeProps) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  // Show skeleton loader if loading is in progress OR if there is no data yet
  const showSkeleton = loadingFileTree || fileTreeItems.length === 0;

  return (
    <aside className="bg-[#0d1117] text-[#c9d1d9] w-80 h-screen overflow-auto border-r border-[#30363d] p-3" style={{ scrollbarColor: 'gray #0d1117', scrollbarWidth: 'thin' }}>
      <div className="text-xs font-semibold text-[#8b949e] mb-4 uppercase tracking-wider">Explorer</div>
      
      {showSkeleton ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 px-1">
              {/* Icon (folder/file) */}
              <div className="w-4 h-4 bg-[#21262d] rounded-sm flex-shrink-0" />
              {/* File name text */}
              <div 
                className="h-3 bg-[#21262d] rounded-sm" 
                style={{ width: `${Math.floor(Math.random() * (60 - 20) + 40)}%` }} 
              />
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
    </aside>
  );
};