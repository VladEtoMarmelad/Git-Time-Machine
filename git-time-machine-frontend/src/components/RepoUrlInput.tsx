import { JobStatus } from "@/types/JobStatus"
import { RefObject } from "react";

interface RepoUrlInputProps {
  repoUrl: RefObject<HTMLInputElement|null>;
  commitsStatus: JobStatus;
  setChosenFilePath: (filePath: string|null) => void;
  fetchCommits: (params: any) => Promise<void>
}

export const RepoUrlInput = ({repoUrl, commitsStatus, setChosenFilePath, fetchCommits}: RepoUrlInputProps) => {

  const handleStartAnalysis = () => {
    if (!repoUrl.current?.value) return;
    setChosenFilePath(null);
    fetchCommits(repoUrl.current?.value);
  };

  return (
    <section className="flex gap-4 mb-4">
      <input
        ref={repoUrl}
        placeholder="Repository URL..."
        className="flex-1 bg-[#010409] text-[#c9d1d9] placeholder-[#8b949e] border border-[#30363d] rounded-md px-3 py-2"
        disabled={commitsStatus === "processing"}
      />
      <button
        onClick={handleStartAnalysis}
        className="bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-2 rounded-md disabled:bg-gray-500"
        disabled={commitsStatus === "processing"}
      >
        {commitsStatus === "processing" ? "Analyzing..." : "Execute"}
      </button>
    </section>
  )
}