import { JobStatus } from "@/types/JobStatus"

interface RepoUrlInputProps {
  commitsStatus: JobStatus;
  repoUrl: string;
  setRepoUrl: (newRepoUrl: string) => void;
  setChosenFilePath: (filePath: string|null) => void;
  fetchCommits: (params: any) => Promise<void>;
  fetchBranches: (params: any) => Promise<void>;
  fetchForks: (params: any) => Promise<void>
}

export const RepoUrlInput = ({commitsStatus, repoUrl, setRepoUrl, setChosenFilePath, fetchCommits, fetchBranches, fetchForks}: RepoUrlInputProps) => {

  const handleStartAnalysis = () => {
    if (!repoUrl) return;
    setChosenFilePath(null);
    fetchCommits({
      url: repoUrl,
      branch: ""
    });
    fetchBranches(repoUrl);
    fetchForks(repoUrl)
  };

  return (
    <section className="flex gap-4 mb-4">
      <input
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
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