import { File } from "./File" 

export interface Commit {
  author: string;
  date: string;
  files: File[];
  hash: string;
  message: string;
}