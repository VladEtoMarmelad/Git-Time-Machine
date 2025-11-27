import { FileTreeItem as FileTreeItemType } from "@/types/FileTreeItem";

interface FileTreeItmeProps {
  fileTreeItem: FileTreeItemType;
  level?: number;
  expanded: Set<string>;
  toggle: (path: string) => void;
  choosedFile?: string | null;
  onSelect?: (path: string) => void;
}

export const FIleTreeItem = ({ fileTreeItem, level = 0, expanded, toggle, choosedFile, onSelect }: FileTreeItmeProps) => {
  const indent = { paddingLeft: `${level * 12}px` };
  const isSelected = choosedFile === fileTreeItem.path;

  return (
    <div>
      <div className={`flex items-center rounded-md ${isSelected ? 'bg-[#0f3c6e] text-white' : 'hover:bg-[#111827]'} transition-colors`} style={indent}>
        {fileTreeItem.isFile ? (
          <button
            className={`text-left w-full truncate px-2 py-1 ${isSelected ? 'font-semibold' : 'text-[#c9d1d9]'}`}
            onClick={() => onSelect?.(fileTreeItem.path)}
          >
            <span className="mr-2 text-sm"><i className="bi bi-file-earmark"/></span>
            <span className="align-middle">{fileTreeItem.name}</span>
          </button>
        ) : (
          <button onClick={() => toggle(fileTreeItem.path)} className="flex items-center w-full px-2 py-1 text-[#8b949e]">
            <span className="inline-block w-4">{expanded.has(fileTreeItem.path) ? "▾" : "▸"}</span>
            <span className="font-medium">
              {expanded.has(fileTreeItem.path) ? 
                <i 
                  className="bi bi-folder2-open" 
                  style={{fontSize: 20}}
                /> 
                : 
                <i 
                  className="bi bi-folder2" 
                  style={{fontSize: 20}}
                /> 
              } 
              {fileTreeItem.name}
            </span>
          </button>
        )}
      </div>

      {fileTreeItem.children && expanded.has(fileTreeItem.path) ? (
        <div>
          {fileTreeItem.children.map((child) => (
            <FIleTreeItem
              key={child.path}
              fileTreeItem={child}
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