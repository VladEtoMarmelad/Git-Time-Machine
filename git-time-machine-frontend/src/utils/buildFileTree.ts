import { File } from "@/types/File";
import { FileTreeItem } from "@/types/FileTreeItem";

export const buildFileTree = (files: File[] = []): FileTreeItem[] => {
  const rootMap = new Map<string, FileTreeItem>();

  const ensureFileTreeItem = (map: Map<string, FileTreeItem>, path: string, name: string) => {
    if (!map.has(path)) map.set(path, { name, path, children: [] });
    return map.get(path)!;
  };

  const childrenMap = new Map<string, Map<string, FileTreeItem>>();

  files.forEach((file) => {
    const parts: string[] = file.path.split("/");
    let path = "";
    let parentMap = rootMap;

    parts.forEach((part, index: number) => {
      path = path ? `${path}/${part}` : part;

      if (!childrenMap.has(path)) {
        childrenMap.set(path, new Map())
      };

      const mapForParent = index === 0 ? rootMap : childrenMap.get(parts.slice(0, index).join("/"))!;

      const fileTreeItem = ensureFileTreeItem(mapForParent, path, part);

      if (index === parts.length - 1) {
        fileTreeItem.isFile = true;
        fileTreeItem.file = file;
      } else {
        if (!childrenMap.has(path)) childrenMap.set(path, new Map());
      }

      parentMap = childrenMap.get(path)!;
    })
  })

  const mapToArray = (map: Map<string, FileTreeItem>): FileTreeItem[] => {
    const fileTreeItems: FileTreeItem[] = [];
    for (const fileTreeItem of map.values()) {
      const childMap = childrenMap.get(fileTreeItem.path);
      if (childMap && childMap.size > 0) {
        fileTreeItem.children = mapToArray(childMap);
      }
      fileTreeItems.push(fileTreeItem);
    }
    fileTreeItems.sort((a, b) => {
      if (!!a.isFile === !!b.isFile) return a.name.localeCompare(b.name);
      return a.isFile ? 1 : -1;
    });
    return fileTreeItems;
  };

  return mapToArray(rootMap);
};