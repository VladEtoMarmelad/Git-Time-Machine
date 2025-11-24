"use client"

import { useState } from "react";
import { FileTreeItem as FileTreeItemType} from "@/types/FileTreeItem";
import { FIleTreeItem } from "@/components/FileTreeItem";

interface FileTreeProps {
  fileTreeItems: FileTreeItemType[];
  choosedFile?: string | null;
  onSelect?: (path: string) => void;
}

export const FileTree = ({ fileTreeItems, choosedFile, onSelect }: FileTreeProps) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      };
      return next;
    });
  };

  return (
    <aside 
      className="bg-[#0d1117] text-[#c9d1d9] w-72 min-w-[260px] h-screen overflow-auto border-r border-[#30363d] p-3" 
      style={{scrollbarColor: 'gray #0d1117', scrollbarWidth: 'thin'}}
    >
      <div className="text-xs font-semibold text-[#8b949e] mb-2">Files</div>
      <div className="space-y-1">
        {fileTreeItems.map((fileTreeItem) => (
          <FIleTreeItem
            key={fileTreeItem.path}
            fileTreeItem={fileTreeItem}
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
