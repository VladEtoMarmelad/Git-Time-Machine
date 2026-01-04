import { FileStatus } from "@sharedTypes/FileStatus";

export interface FileTreeItem {
  name: string;
  path: string;
  status: FileStatus;
  children?: FileTreeItem[];
  isFile?: boolean;
  file?: any;
}