"use client"

import { useEffect, useRef, useState } from "react";
import { FileTree } from "@/components/FileTree";
import { Node } from "@/types/Node";
import axios from "axios";

export default function Home() {
  const [lastCommit, setLastCommit] = useState<any>(null);
  const [choosedFile, setChoosedFile] = useState<string | null>(null);
  const [file, setFile] = useState<any>(null);
  const repoUrl = useRef<HTMLInputElement>(null)

  const getAllCommits = async () => {
    const commits = await axios.get("http://localhost:3030/git/commits", {
      params: {repoUrl: repoUrl.current?.value}
    });
    console.log("commits: ", commits.data)
    setLastCommit(commits.data.commits[0])
  }

  const getFileContent = async (path?: string) => {
    const target = path ?? choosedFile;
    if (!target || !lastCommit?.hash) {
      setFile(null);
      return;
    }

    try {
      const res = await axios.get("http://localhost:3030/git/file", {
        params: {
          repoUrl: repoUrl.current?.value,
          hash: lastCommit.hash,
          path: target,
        },
      });
      console.log("fileContent.data: ", res.data);
      setFile(res.data);
    } catch (err) {
      console.error("Failed to fetch file content", err);
      setFile(null);
    }
  }

  // Fetch file content whenever the chosen file or the last commit changes
  useEffect(() => {
    if (choosedFile) getFileContent();
  }, [choosedFile, lastCommit]);

  // Build a nested tree structure from flat file paths
  const buildTree = (files: any[] = []) => {
    const rootMap = new Map<string, Node>();

    const ensureNode = (map: Map<string, Node>, key: string, name: string, path: string) => {
      if (!map.has(key)) map.set(key, { name, path, children: [] });
      return map.get(key)!;
    };

    const childrenMap = new Map<string, Map<string, Node>>();

    files.forEach((file) => {
      const parts = file.path.split("/");
      let accum = "";
      let parentMap = rootMap;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        accum = accum ? `${accum}/${part}` : part;

        if (!childrenMap.has(accum)) childrenMap.set(accum, new Map());

        const mapForParent = i === 0 ? rootMap : childrenMap.get(parts.slice(0, i).join('/'))!;

        const node = ensureNode(mapForParent, accum, part, accum);

        if (i === parts.length - 1) {
          node.isFile = true;
          node.file = file;
        } else {
          // ensure this node has a children map to receive deeper nodes
          if (!childrenMap.has(accum)) childrenMap.set(accum, new Map());
        }

        parentMap = childrenMap.get(accum)!;
      }
    })

    const mapToArray = (map: Map<string, Node>): Node[] => {
      const arr: Node[] = [];
      for (const node of map.values()) {
        const childMap = childrenMap.get(node.path);
        if (childMap && childMap.size > 0) node.children = mapToArray(childMap);
        arr.push(node);
      }
      arr.sort((a, b) => {
        if (!!a.isFile === !!b.isFile) return a.name.localeCompare(b.name);
        return a.isFile ? 1 : -1;
      });
      return arr;
    };

    return mapToArray(rootMap);
  };

  return (
    <div className="flex flex-col min-h-screen items-center font-sans">
      <section className="flex flex-row size-full">
        <section className="bg-slate-900 h-[100%] justify-start">
          <p>Files</p>
          {(lastCommit && lastCommit.files) && (
            <div className="p-2 text-sm">
              <FileTree
                nodes={buildTree(lastCommit.files)}
                choosedFile={choosedFile}
                onSelect={(path) => { setChoosedFile(path); getFileContent(path); }}
              />
            </div>
          )}
        </section>

        <section className="bg-slate-900 w-[100%] justify-self-end ml-1 p-5">
          <section className="flex">
            <input 
              ref={repoUrl}
              placeholder="Repository URL..."
              className="w-full h-fit p-2 mr-5"
            />
            <button
              onClick={() => getAllCommits()}
              className="z-42 cursor-pointer"
            >
              Execute
            </button>
          </section>

          <section>
            <p>File review</p><br/>
            <pre>{file?.content}</pre> 
          </section>
        </section>
      </section>
    </div>
  );
}
