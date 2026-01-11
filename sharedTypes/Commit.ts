import { File, FileTreeMode } from "./index" 

export interface Commit {
  author: string;
  date: string;
  files: File[];
  hash: string;
  message: string;
  fileTreeMode?: FileTreeMode;
}