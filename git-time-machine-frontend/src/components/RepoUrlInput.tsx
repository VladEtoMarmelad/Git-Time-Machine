import { JobStatus } from "@/types/JobStatus"
import { CaretIcon } from "./icons";

interface RepoUrlInputProps {
  commitsStatus: JobStatus;
  repoUrl: string;
  fileTreeMode: "full"|"changes";
  setFileTreeMode: (value: "full"|"changes") => void;
  setRepoUrl: (newRepoUrl: string) => void;
  setChosenFilePath: (filePath: string|null) => void;
  fetchCommits: (params: any) => Promise<void>;
  fetchRepositoryMetadata: (params: any) => Promise<void>;
  fetchForks: (params: any) => Promise<void>;
}

export const RepoUrlInput = ({
  commitsStatus, 
  repoUrl, 
  fileTreeMode,
  setRepoUrl, 
  setChosenFilePath, 
  fetchCommits, 
  fetchRepositoryMetadata, 
  fetchForks,
  setFileTreeMode
}: RepoUrlInputProps) => {

  const handleStartAnalysis = () => {
    if (!repoUrl) return;
    setChosenFilePath(null);
    fetchCommits({
      url: repoUrl,
      branch: "",
      fileTreeMode
    });
    fetchRepositoryMetadata(repoUrl);
    fetchForks({
      url: repoUrl,
      maxForksAmount: 50
    })
  };

  return (
    <section className="flex gap-4 mb-4">
      <input
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        placeholder="Repository URL..."
        className="flex-1 bg-[#010409] text-[#c9d1d9] placeholder-[#8b949e] border border-[#30363d] rounded-md px-3 py-2 focus:border-[#1f6feb] focus:outline-none"
        disabled={commitsStatus === "processing"}
      />
      
      <button
        onClick={handleStartAnalysis}
        className="bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-2 rounded-md disabled:bg-gray-500 font-medium transition-colors"
        disabled={commitsStatus === "processing"}
      >
        {commitsStatus === "processing" ? "Analyzing..." : "Execute"}
      </button>

      <div className="relative flex items-center">
        <select
          value={fileTreeMode}
          onChange={(e) => setFileTreeMode(e.target.value as "full"|"changes")}
          disabled={commitsStatus === "processing"}
          className="bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded-md px-3 py-2 appearance-none pr-8 cursor-pointer hover:bg-[#30363d] focus:outline-none focus:border-[#8b949e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="changes">Changes only file tree</option>
          <option value="full">Full file tree</option>
        </select>

        <CaretIcon className="absolute right-3 pointer-events-none"/>
      </div>
    </section>
  )
}