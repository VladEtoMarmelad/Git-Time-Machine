"use client"

import { useState } from "react";
import { Node } from "../types/Node";
import { TreeNode } from "./TreeNode";

interface FileTreeProps {
  nodes: Node[];
  choosedFile?: string | null;
  onSelect?: (path: string) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({ nodes, choosedFile, onSelect }) => {
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
    <>
      {nodes.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          level={0}
          expanded={expanded}
          toggle={toggle}
          choosedFile={choosedFile}
          onSelect={onSelect}
        />
      ))}
    </>
  );
};

export default FileTree;
