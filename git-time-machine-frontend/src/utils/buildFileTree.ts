import { FileTreeItem as FileTreeItemType} from "@/types/FileTreeItem";
import { File, FileStatus } from "@sharedTypes/index";

// Utility to transform a flat list of files into a tree structure
export const buildFileTree = (files: File[]): FileTreeItemType[] => {
  const root: any = {};
  
  files.forEach(file => {
    const parts = file.path.split('/');
    let current = root;
    
    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = { 
          __data: { 
            name: part, 
            path: parts.slice(0, index + 1).join('/'),
            isFile: index === parts.length - 1,
            status: 'unchanged' as FileStatus
          } 
        };
      }
      
      // If it's a file, record its status
      if (index === parts.length - 1) {
        current[part].__data.status = file.status;
      }
      current = current[part];
    });
  });

  const convert = (obj: any): FileTreeItemType[] => {
    return Object.keys(obj)
      .filter(key => key !== '__data')
      .map(key => {
        const item = obj[key];
        const children = convert(item);
        const data = item.__data;

        // Status logic for a FOLDER:
        // If at least one child is modified or added, the folder is marked as 'modified'
        if (children.length > 0) {
          const hasChanged = children.some(c => c.status !== 'unchanged');
          data.status = hasChanged ? 'modified' : 'unchanged';
          data.children = children.sort((a, b) => (a.isFile === b.isFile ? a.name.localeCompare(b.name) : a.isFile ? 1 : -1));
        }
        
        return data;
      });
  };

  return convert(root).sort((a, b) => (a.isFile === b.isFile ? a.name.localeCompare(b.name) : a.isFile ? 1 : -1));
};