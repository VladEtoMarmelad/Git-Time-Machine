import { FileTreeItem as FileTreeItemType } from "@/types/FileTreeItem";
import { FileStatus } from "@sharedTypes/FileStatus";

interface FileTreeItemProps {
  fileTreeItem: FileTreeItemType;
  level?: number;
  expanded: Set<string>;
  choosedFile?: string | null;
  toggle: (path: string) => void;
  onSelect?: (path: string) => void;
}

// Function to get color depending on status
const getStatusColor = (status: FileStatus) => {
  switch (status) {
    case 'added': return 'text-green-400';    // New file
    case 'modified': return 'text-amber-400'; // Modified file
    default: return 'text-[#8b949e]';         // Unchanged file
  }
};

export const FIleTreeItem = ({ fileTreeItem, level = 0, expanded, toggle, choosedFile, onSelect }: FileTreeItemProps) => {
  const indent = { paddingLeft: `${level * 12}px` };
  const isSelected = choosedFile === fileTreeItem.path;
  const statusColor = getStatusColor(fileTreeItem.status);

  return (
    <>
      <div 
        className={`flex items-center group rounded-md ${isSelected ? 'bg-[#1e293b] text-white' : 'hover:bg-[#161b22]'} transition-colors cursor-pointer`} 
        style={indent}
      >
        {fileTreeItem.isFile ? (
          <button
            className={`flex items-center w-full text-left truncate px-2 py-1 text-sm ${isSelected ? 'font-bold' : 'text-[#c9d1d9]'}`}
            onClick={() => onSelect?.(fileTreeItem.path)}
          >
            <span className={`mr-2 ${statusColor}`}>
              <i className="bi bi-file-earmark-code"/>
            </span>
            <span className="truncate">{fileTreeItem.name}</span>
          </button>
        ) : (
          <button 
            onClick={() => toggle(fileTreeItem.path)} 
            className="flex items-center w-full px-2 py-1 text-sm text-[#8b949e]"
          >
            <span className="w-4 flex-shrink-0">{expanded.has(fileTreeItem.path) ? "▾" : "▸"}</span>
            <span className={`mr-2 ${statusColor}`}>
              {expanded.has(fileTreeItem.path) ? <i className="bi bi-folder2-open"/> : <i className="bi bi-folder2"/>}
            </span>
            <span className="font-medium text-[#c9d1d9] truncate">{fileTreeItem.name}</span>
          </button>
        )}
      </div>

      {fileTreeItem.children && expanded.has(fileTreeItem.path) && (
        <div className="mt-1">
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
      )}
    </>
  );
};