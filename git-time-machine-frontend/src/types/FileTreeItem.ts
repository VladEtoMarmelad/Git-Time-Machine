import { FileStatus } from "@sharedTypes/index";

export interface FileTreeItem {
  name: string;
  path: string;
  status: FileStatus;
  children?: FileTreeItem[];
  isFile?: boolean;
  file?: any;
}