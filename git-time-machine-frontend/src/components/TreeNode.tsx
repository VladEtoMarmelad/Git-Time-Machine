import { Node } from "../types/Node";

interface TreeNodeProps {
  node: Node;
  level?: number;
  expanded: Set<string>;
  toggle: (path: string) => void;
  choosedFile?: string | null;
  onSelect?: (path: string) => void;
}

export const TreeNode = ({ node, level = 0, expanded, toggle, choosedFile, onSelect }: TreeNodeProps) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center" style={{ paddingLeft: level * 12 }}>
        {node.isFile ? (
          <button
            className={`text-left w-full truncate ${choosedFile === node.path ? "font-bold text-white" : "text-gray-300"}`}
            onClick={() => onSelect?.(node.path)}
          >
            📄 {node.name}
          </button>
        ) : (
          <div className="flex items-center w-full text-gray-200">
            <button onClick={() => toggle(node.path)} className="mr-2">
              {expanded.has(node.path) ? "▾" : "▸"}
            </button>
            <span className="font-medium">📁 {node.name}</span>
          </div>
        )}
      </div>

      {node.children && expanded.has(node.path) ? (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              level={level + 1}
              expanded={expanded}
              toggle={toggle}
              choosedFile={choosedFile}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};