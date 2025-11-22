export interface Node {
  name: string; 
  path: string; 
  children?: Node[]; 
  isFile?: boolean; 
  file?: any 
};