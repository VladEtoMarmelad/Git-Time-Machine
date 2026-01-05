import { Commit, Repository } from "@sharedTypes/index";
import { CommitMetadata } from "./CommitInfo/CommitMetadata";
import { RepoInfo } from "./RepoInfo";
import { CopyableCommitHash } from "./CommitInfo/CopyableCommitHash";

interface RepoAndCommitInfoProps {
  commit: Commit;
  repositoryMetadata: any;
  repoUrl: string;
  selectedBranch: string;
  forks: Repository[]|null;
  fetchCommits: (params: any) => Promise<void>;
  fetchRepositoryMetadata: (params: any) => Promise<void>;
  fetchForks: (params: any) => Promise<void>;
  setSelectedBranch: (branchName: string) => void;
  setRepoUrl: (newRepoUrl: string) => void
}

export const RepoAndCommitInfo = ({ 
  commit, 
  repositoryMetadata, 
  repoUrl, 
  selectedBranch, 
  forks,
  fetchCommits,
  fetchRepositoryMetadata,
  fetchForks,
  setSelectedBranch,
  setRepoUrl
}: RepoAndCommitInfoProps) => {


  return (
    <div className="w-full bg-[#0d1117] font-sans mb-4">
      <div className="flex items-start justify-between p-4 border border-[#21262d] rounded-[6px] transition-colors hover:border-[#30363d]">
        
        {/* LEFT COLUMN: Message and metadata */}
        <CommitMetadata 
          commit={commit}
          repoUrl={repoUrl}
        />

        {/* RIGHT COLUMN: Forks, Branches, Hash and Buttons */}
        <div className="flex items-center gap-2 pl-2 h-8">
          <RepoInfo 
            repositoryMetadata={repositoryMetadata}
            forks={forks}
            repoUrl={repoUrl}
            selectedBranch={selectedBranch}
            fetchCommits={fetchCommits}
            fetchRepositoryMetadata={fetchRepositoryMetadata}
            fetchForks={fetchForks}
            setSelectedBranch={setSelectedBranch}
            setRepoUrl={setRepoUrl}
          />  

          {/* HASH & COPY GROUP */}
          <CopyableCommitHash hash={commit.hash}/>
        </div>
      </div>
    </div>
  );
};