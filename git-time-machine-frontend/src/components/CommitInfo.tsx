import { Commit } from "@sharedTypes/Commit";
import { useState, useRef, useEffect } from "react";
import { BranchIcon, CaretIcon, CheckIcon, CopyIcon } from "./icons";
import Link from "next/link";

interface CommitInfoProps {
  commit: Commit;
  branches: string[] | null;
  repoUrl: string;
  selectedBranch: string;
  fetchCommits: (params: any) => Promise<void>;
  setSelectedBranch: (branchName: string) => void
}

export const CommitInfo = ({ commit, branches, repoUrl, selectedBranch, fetchCommits, setSelectedBranch }: CommitInfoProps) => {
  const [copied, setCopied] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const shortHash = commit.hash.slice(0, 7);
  const hasBranches = branches && branches.length > 0;

  const formattedDate = new Intl.DateTimeFormat("en-EN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(commit.date));

  const handleCopy = () => {
    navigator.clipboard.writeText(commit.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBranchSelect = (branchName: string) => {
    fetchCommits({
      url: repoUrl,
      branch: branchName,
    });
    setSelectedBranch(branchName);
    setIsBranchDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dropdownTriggerClass = isBranchDropdownOpen
    ? "bg-[#30363d] border-[#8b949e] text-[#e6edf3]"
    : "bg-[#21262d] border-[#30363d] text-[#7d8590] hover:bg-[#30363d] hover:text-[#e6edf3]";

  return (
    <div className="w-full bg-[#0d1117] font-sans mb-4">
      <div className="flex items-start justify-between p-4 border border-[#21262d] rounded-[6px] transition-colors">
        
        {/* LEFT COLUMN: Message and metadata */}
        <div className="flex flex-col gap-1 pr-4">
          <Link
            href={`${repoUrl}/commit/${commit.hash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3 className="text-[16px] font-semibold text-[#e6edf3] hover:text-[#4493f8] hover:underline cursor-pointer leading-tight">
              {commit.message}
            </h3>
          </Link>

          <div className="flex items-center gap-2 mt-1 text-xs text-[#7d8590]">
            <Link
              href={`https://github.com/${commit.author}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#e6edf3] hover:underline hover:text-[#4493f8] cursor-pointer"
            >
              {commit.author}
            </Link>
            <span>committed on {formattedDate}</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Branches, Hash and Buttons */}
        <div className="flex items-center gap-3 pl-2 h-8">
          
          {/* BRANCH DROPDOWN */}
          {hasBranches && (
            <div className="relative h-full" ref={dropdownRef}>
              <button
                onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                className={`flex items-center gap-2 px-3 h-full text-xs font-medium border rounded-md transition-colors ${dropdownTriggerClass}`}
                title="List branches containing this commit"
              >
                <BranchIcon className="mr-1 fill-gray-400" />
                
                <span className="max-w-[100px] truncate">
                  {branches.length === 1 ? branches[0] : `${branches.length} branches`}
                </span>
                
                <CaretIcon />
              </button>

              {isBranchDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 z-50 bg-[#161b22] border border-[#30363d] rounded-md shadow-xl overflow-hidden flex flex-col">
                  <div className="px-3 py-2 text-xs font-bold text-[#e6edf3] border-b border-[#30363d] bg-[#161b22]">
                    Branches containing this commit
                  </div>
                  <ul className="max-h-60 overflow-y-auto py-1">
                    {branches.map((branch) => {
                      const isSelected = selectedBranch === branch;
                      
                      return (
                        <li key={branch}>
                          <button
                            onClick={() => handleBranchSelect(branch)}
                            className={`flex items-center gap-2 px-3 py-2 text-xs w-full transition-colors group ${
                              isSelected
                                ? "bg-[#30363d] text-[#58a6ff]" // Стили активной ветки
                                : "text-[#c9d1d9] hover:bg-[#30363d] hover:text-[#58a6ff]" // Обычные стили
                            }`}
                          >
                            <BranchIcon 
                              className={`mr-1 ${isSelected ? "fill-[#58a6ff]" : "fill-gray-400"}`} 
                            />
                            <span className="truncate font-mono flex-1 text-left">{branch}</span>
                            
                            {/* Показываем галочку, если ветка выбрана */}
                            {isSelected && <CheckIcon className="w-3 h-3 fill-[#58a6ff]" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* HASH & COPY GROUP */}
          <div className="flex items-center h-full text-xs border border-[#30363d] rounded-md bg-[#21262d] overflow-hidden">
            <button
              className="px-3 h-full font-mono text-[#7d8590] hover:text-[#4493f8] hover:underline border-r border-[#30363d] transition-colors"
              title={`View commit details for ${shortHash}`}
            >
              {shortHash}
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center justify-center w-8 h-full hover:bg-[#30363d] transition-colors group border-l border-transparent"
              title="Copy full SHA"
              aria-label="Copy full SHA"
            >
              {copied ? (
                <CheckIcon />
              ) : (
                <CopyIcon className="group-hover:fill-[#e6edf3]" />
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};