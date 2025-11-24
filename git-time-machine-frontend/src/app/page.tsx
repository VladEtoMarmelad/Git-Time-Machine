"use client"

import { useEffect, useRef, useState } from "react";
import { FileTree } from "@/components/FileTree";
import { RangeSlider } from "@/components/RangeSlider";
import { buildFileTree } from "@/utils/buildFileTree";
import { File } from "@/types/File";
import axios from "axios";

export default function Home() {
  const [commits, setCommits] = useState<any>(null);
  const [choosedFile, setChoosedFile] = useState<string | null>(null);
  const [file, setFile] = useState<File|null>(null);
  const repoUrl = useRef<HTMLInputElement>(null)

  const getAllCommits = async () => {
    const commits = await axios.get("http://localhost:3030/git/commits", {
      params: {repoUrl: repoUrl.current?.value}
    });
    console.log("commits: ", commits.data)
    setCommits(commits.data.commits)
  }

  const getFileContent = async (path?: string) => {
    const target = path ?? choosedFile;
    if (!target || !commits) {
      setFile(null);
      return;
    }

    try {
      const res = await axios.get("http://localhost:3030/git/file", {
        params: {
          repoUrl: repoUrl.current?.value,
          hash: commits[0].hash,
          path: target
        }
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
  }, [choosedFile, commits]);

  return (
    <div className="flex min-h-screen font-sans bg-[#0b1117] text-[#c9d1d9]">
      <div className="flex w-full">
        <div className="flex-shrink-0">
          {(commits && commits[0] && commits[0].files) && 
            <FileTree
              fileTreeItems={buildFileTree(commits[0].files)}
              choosedFile={choosedFile}
              onSelect={(path) => { setChoosedFile(path); getFileContent(path) }}
            />
          }
        </div>

        <main className="flex-1 p-6">
          <div className="flex gap-4 mb-4">
            <input
              ref={repoUrl}
              placeholder="Repository URL..."
              className="flex-1 bg-[#010409] text-[#c9d1d9] placeholder-[#8b949e] border border-[#30363d] rounded-md px-3 py-2"
            />
            <button
              onClick={() => getAllCommits()}
              className="bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-2 rounded-md"
            >
              Execute
            </button>
          </div>

          <section style={{scrollbarColor: 'gray #010409', scrollbarWidth: 'thin'}}>
            <h2 className="text-lg font-semibold mb-2">File review</h2>
            <div className="bg-[#010409] border border-[#30363d] rounded-md p-4 text-sm text-[#c9d1d9]">
              <pre className="whitespace-pre-wrap break-words max-h-[60vh] overflow-auto font-mono">
                {file?.content ?? "No file selected"}
              </pre>
            </div>
          </section>

          {commits && <RangeSlider commits={commits}/>}
        </main>
      </div>
    </div>
  );
}
