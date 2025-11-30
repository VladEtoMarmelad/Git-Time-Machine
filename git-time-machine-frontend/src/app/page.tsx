"use client"

import { useEffect, useRef, useState } from "react";
import { FileTree } from "@/components/FileTree";
import { RangeSlider } from "@/components/RangeSlider";
import { buildFileTree } from "@/utils/buildFileTree";
import { File } from "@sharedTypes/File";
import { Commit } from "@sharedTypes/Commit"
import { JobStatus } from "@/types/JobStatus";
import axios from "axios";

export default function Home() {
  const [commits, setCommits] = useState<Commit[] | null>(null);
  const [choosedFile, setChoosedFile] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [selectedCommitIndex, setSelectedCommitIndex] = useState<number>(0);
  const repoUrl = useRef<HTMLInputElement>(null);

  // State for repository analysis job
  const [commitsJobId, setAnalysisJobId] = useState<string | null>(null);
  const [commitsStatus, setAnalysisStatus] = useState<JobStatus>("idle");
  const [commitsError, setAnalysisError] = useState<string | null>(null);
  const commitsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // State for file content fetching job
  const [fileJobId, setFileJobId] = useState<string | null>(null);
  const [fileStatus, setFileStatus] = useState<JobStatus>("idle");
  const [fileError, setFileError] = useState<string | null>(null);
  const fileIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- Step 1: Start Repository Analysis ---
  const startAnalysis = async () => {
    setCommits(null);
    setChoosedFile(null);
    setFile(null);
    setAnalysisJobId(null);
    setAnalysisError(null);
    setAnalysisStatus("processing");

    try {
      const response = await axios.post("http://localhost:3030/git/getCommits", { repoUrl: repoUrl.current?.value });
      setAnalysisJobId(response.data.jobId);
    } catch (error: any) {
      setAnalysisStatus("failed");
      setAnalysisError(error.response?.data?.message || "Failed to start the analysis job.");
    }
  };

  // --- Step 2: Poll for Repository Analysis Status ---
  const pollAnalysisJob = async (id: string) => {
    try {
      const response = await axios.get(`http://localhost:3030/git/getCommits/${id}`);
      const { state, result, failedReason } = response.data;

      if (state === "completed") {
        setAnalysisStatus("completed");
        setCommits(result.commits);
        if (commitsIntervalRef.current) clearInterval(commitsIntervalRef.current);
      } else if (state === "failed") {
        setAnalysisStatus("failed");
        setAnalysisError(failedReason);
        if (commitsIntervalRef.current) clearInterval(commitsIntervalRef.current);
      }
    } catch (err) {
      setAnalysisStatus("failed");
      setAnalysisError("Could not poll job status. The server might be down.");
      if (commitsIntervalRef.current) clearInterval(commitsIntervalRef.current);
    }
  };

  // --- Step 3: Start File Content Fetch ---
  const getFileContent = async (path: string) => {
    if (!commits || !repoUrl.current?.value) return;

    setChoosedFile(path);
    setFile(null); // Reset previous file
    setFileJobId(null);
    setFileError(null);
    setFileStatus("processing");

    try {
      const currentCommit = commits[selectedCommitIndex];
      const response = await axios.post("http://localhost:3030/git/file", {
        repoUrl: repoUrl.current.value,
        commitHash: currentCommit.hash,
        filePath: path,
      });
      setFileJobId(response.data.jobId);
    } catch (error: any) {
      setFileStatus("failed");
      setFileError(error.response?.data?.message || "Failed to start file fetching job.");
    }
  };

  // --- Step 4: Poll for File Content Status ---
  const pollFileJob = async (id: string) => {
    try {
      const response = await axios.get(`http://localhost:3030/git/file/${id}`);
      const { state, result, failedReason } = response.data;

      if (state === "completed") {
        setFileStatus("completed");
        setFile(result);
        if (fileIntervalRef.current) clearInterval(fileIntervalRef.current);
      } else if (state === "failed") {
        setFileStatus("failed");
        setFileError(failedReason);
        if (fileIntervalRef.current) clearInterval(fileIntervalRef.current);
      }
    } catch (err) {
      setFileStatus("failed");
      setFileError("Could not poll file job status.");
      if (fileIntervalRef.current) clearInterval(fileIntervalRef.current);
    }
  };

  // --- useEffect for polling ANALYSIS job ---
  useEffect(() => {
    if (commitsJobId && commitsStatus === "processing") {
      commitsIntervalRef.current = setInterval(() => {
        pollAnalysisJob(commitsJobId);
      }, 2000);
    }
    return () => {
      if (commitsIntervalRef.current) clearInterval(commitsIntervalRef.current);
    };
  }, [commitsJobId, commitsStatus]);

  // --- useEffect for polling FILE job ---
  useEffect(() => {
    if (fileJobId && fileStatus === "processing") {
      fileIntervalRef.current = setInterval(() => {
        pollFileJob(fileJobId);
      }, 1000);
    }
    return () => {
      if (fileIntervalRef.current) clearInterval(fileIntervalRef.current);
    };
  }, [fileJobId, fileStatus]);
  
  // When the slider changes the commit, if a file was already selected,
  // re-fetch its content for the new commit.
  useEffect(() => {
    if (choosedFile) {
      getFileContent(choosedFile);
    }
  }, [selectedCommitIndex]);


  return (
    <div className="flex min-h-screen font-sans bg-[#0b1117] text-[#c9d1d9]">
      <div className="flex w-full">
        <div className="flex-shrink-0">
          {commitsStatus === "processing" && <div className="p-4">Analyzing repository...</div>}
          {commitsStatus === "failed" && <div className="p-4 text-red-500">Error: {commitsError}</div>}
          {(commits && commits[selectedCommitIndex]?.files) &&
            <FileTree
              fileTreeItems={buildFileTree(commits[selectedCommitIndex].files)}
              choosedFile={choosedFile}
              onSelect={(path) => getFileContent(path)}
            />
          }
        </div>

        <main className="flex-1 p-6">
          <div className="flex gap-4 mb-4">
            <input
              ref={repoUrl}
              placeholder="Repository URL..."
              className="flex-1 bg-[#010409] text-[#c9d1d9] placeholder-[#8b949e] border border-[#30363d] rounded-md px-3 py-2"
              disabled={commitsStatus === "processing"}
            />
            <button
              onClick={startAnalysis}
              className="bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-2 rounded-md disabled:bg-gray-500"
              disabled={commitsStatus === "processing"}
            >
              {commitsStatus === "processing" ? "Analyzing..." : "Execute"}
            </button>
          </div>

          <section style={{ scrollbarColor: 'gray #010409', scrollbarWidth: 'thin' }}>
            <h2 className="text-lg font-semibold mb-2">File review</h2>
            <div className="bg-[#010409] border border-[#30363d] rounded-md p-4 text-sm text-[#c9d1d9] min-h-[60vh]">
              <pre className="whitespace-pre-wrap break-words max-h-[60vh] overflow-auto font-mono">
                {fileStatus === "processing" && "Loading file content..."}
                {fileStatus === "failed" && <span className="text-red-500">{fileError}</span>}
                {fileStatus !== "processing" && file?.content}
                {fileStatus === "idle" && !choosedFile && "Select a file to view its content."}
              </pre>
            </div>
          </section>

          {commits &&
            <RangeSlider
              commits={commits}
              selectedCommitIndex={selectedCommitIndex}
              setSelectedCommitIndex={setSelectedCommitIndex}
            />
          }
        </main>
      </div>
    </div>
  );
}
