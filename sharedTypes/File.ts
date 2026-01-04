import { FileStatus } from "./FileStatus";

export interface File {
  hash?: string;
  path: string;
  status: FileStatus;
  content?: string;
  previousContent?: string|null
}