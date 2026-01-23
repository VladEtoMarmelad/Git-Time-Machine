import { FileStatus } from "./FileStatus";

export interface File {
  hash?: string;
  path: string;
  status: FileStatus;
  displayHint?: string
  content?: string;
  previousContent?: string|null
}