export interface FileTreeItem {
  name: string;
  path: string;
  children?: FileTreeItem[];
  isFile?: boolean;
  file?: any;
}