import { Repository } from "@sharedTypes/Repository";
import { BranchBadge } from "./BranchBadge"
import { BranchDropdown } from "./BranchDropdown"
import { ForkDropdown } from "./ForkDropdown"
import { useEffect, useRef, useState } from "react";
import { StarBadge } from "./StarBadge";
import { DescriptionDropdown } from "./DescriptionDropdown";

interface RepoInfoProps {
  repositoryMetadata: any;
  forks: Repository[]|null;
  repoUrl: string;
  selectedBranch: string;
  fetchCommits: (params: any) => Promise<void>;
  fetchRepositoryMetadata: (params: any) => Promise<void>;
  fetchForks: (params: any) => Promise<void>;
  setSelectedBranch: (branchName: string) => void;
  setRepoUrl: (newRepoUrl: string) => void
}

export const RepoInfo = ({
  repositoryMetadata,
  forks, 
  repoUrl, 
  selectedBranch, 
  fetchCommits, 
  fetchRepositoryMetadata, 
  fetchForks, 
  setSelectedBranch, 
  setRepoUrl
}: RepoInfoProps) => {
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  console.log("repositoryMetadata: ", repositoryMetadata)

  const hasBranches = repositoryMetadata.branches && repositoryMetadata.branches.length > 0;
  const hasForks = forks && forks.length > 0;

  return (
    <>
      {/* FORK DROPDOWN */}
      {hasForks && 
        <ForkDropdown 
          forks={forks} 
          currentRepoUrl={repoUrl}
          fetchCommits={fetchCommits}
          fetchRepositoryMetadata={fetchRepositoryMetadata}
          fetchForks={fetchForks}
          setRepoUrl={setRepoUrl}
        />
      }
      
      {/* BRANCH BADGE */}
      {selectedBranch && <BranchBadge selectedBranch={selectedBranch}/>}
      
      {/* BRANCH DROPDOWN */}
      {hasBranches && 
        <BranchDropdown 
          branches={repositoryMetadata.branches}
          selectedBranch={selectedBranch}
          repoUrl={repoUrl}
          fetchCommits={fetchCommits}
          setSelectedBranch={setSelectedBranch}
          setIsBranchDropdownOpen={setIsBranchDropdownOpen} 
          isBranchDropdownOpen={isBranchDropdownOpen} 
          dropdownRef={dropdownRef}           
        />
      }  

      <DescriptionDropdown repoDescription={repositoryMetadata.description}/>  

      <StarBadge starsAmount={repositoryMetadata.stars}/>
    </>
  )
}