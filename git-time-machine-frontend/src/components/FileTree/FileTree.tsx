"use client"

import { useState } from "react";
import { FIleTreeItem } from "@/components/FileTree/FileTreeItem";
import { FileTreeItem as FileTreeItemType } from "@/types/FileTreeItem";

interface FileTreeProps {
  fileTreeItems: FileTreeItemType[];
  choosedFile: string|null;
  onSelect: (p: string) => void;
}

export const FileTree = ({ fileTreeItems, choosedFile, onSelect }: FileTreeProps) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  return (
    <aside className="bg-[#0d1117] text-[#c9d1d9] w-80 h-screen overflow-auto border-r border-[#30363d] p-3">
      <div className="text-xs font-semibold text-[#8b949e] mb-4 uppercase tracking-wider">Explorer</div>
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
    </aside>
  );
};
