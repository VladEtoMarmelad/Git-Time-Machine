import { Commit } from "@sharedTypes/Commit";
import { useState, useRef, useEffect } from "react";
import { BranchDropdown } from "./BranchDropdown";
import { CopyableCommitHash } from "./CopyableCommitHash";
import { BranchBadge } from "./BranchBadge";
import { CommitMetadata } from "./CommitMetadata";
import { ForkDropdown } from "./ForkDropdown";
import { Repository } from "@sharedTypes/Repository";

interface CommitInfoProps {
  commit: Commit;
  branches: string[] | null;
  repoUrl: string;
  selectedBranch: string;
  forks: Repository[]|null;
  fetchCommits: (params: any) => Promise<void>;
  fetchBranches: (params: any) => Promise<void>;
  fetchForks: (params: any) => Promise<void>;
  setSelectedBranch: (branchName: string) => void
}

export const CommitInfo = ({ 
  commit, 
  branches, 
  repoUrl, 
  selectedBranch, 
  forks,
  fetchCommits,
  fetchBranches,
  fetchForks,
  setSelectedBranch 
}: CommitInfoProps) => {
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasBranches = branches && branches.length > 0;
  const hasForks = forks && forks.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          
          {/* FORK DROPDOWN */}
          {hasForks && 
            <ForkDropdown 
              forks={forks} 
              fetchCommits={fetchCommits}
              fetchBranches={fetchBranches}
              fetchForks={fetchForks}
            />
          }

          {/* BRANCH BADGE */}
          {selectedBranch && <BranchBadge selectedBranch={selectedBranch}/>}

          {/* BRANCH DROPDOWN */}
          {hasBranches && 
            <BranchDropdown 
              branches={branches}
              selectedBranch={selectedBranch}
              repoUrl={repoUrl}
              fetchCommits={fetchCommits}
              setSelectedBranch={setSelectedBranch}
              setIsBranchDropdownOpen={setIsBranchDropdownOpen} 
              isBranchDropdownOpen={isBranchDropdownOpen} 
              dropdownRef={dropdownRef}           
            />
          }

          {/* HASH & COPY GROUP */}
          <CopyableCommitHash hash={commit.hash}/>
        </div>
      </div>
    </div>
  );
};