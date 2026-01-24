import { FileStatus, FileDisplayHint } from "./index";

export interface File {
  hash?: string;
  path: string;
  status: FileStatus;
  displayHint?: FileDisplayHint
  content?: string;
  previousContent?: string|null
}