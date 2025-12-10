import { Commit } from "@sharedTypes/Commit";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface CommitInfoProps {
  commit: Commit;
  branches: string[] | null;
  repoUrl: string;
  fetchCommits: (params: any) => Promise<void>
}

export const CommitInfo = ({ commit, branches, repoUrl, fetchCommits}: CommitInfoProps) => {
  const [copied, setCopied] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [selectedBranchIndex, setSelectedBranchIndex] = useState<number|null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null);

  // GitHub shows the first 7 characters of the hash
  const shortHash = commit.hash.slice(0, 7);

  // Date formatting
  const dateObj = new Date(commit.date);
  const formattedDate = new Intl.DateTimeFormat("en-EN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(dateObj);

  const handleCopy = () => {
    navigator.clipboard.writeText(commit.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGetCommitsFromBranch = () => {
    fetchCommits({
      url: repoUrl, 
      branch: branches ? branches[selectedBranchIndex ? selectedBranchIndex : 0] : ""
    });
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const hasBranches = branches && branches.length > 0;

  return (
    <div className="w-full bg-[#0d1117] font-sans mb-4">
      <div className="flex items-start justify-between p-4 border border-[#21262d] rounded-[6px] transition-colors">
        
        {/* LEFT COLUMN: Message and metadata */}
        <div className="flex flex-col gap-1 pr-4">
          {/* Commit message */}
          <Link
            href={`${repoUrl}/commit/${commit.hash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3 className="text-[16px] font-semibold text-[#e6edf3] hover:text-[#4493f8] hover:underline cursor-pointer leading-tight">
              {commit.message}
            </h3>
          </Link>

          {/* Author and date */}
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
                className={`flex items-center gap-2 px-3 h-full text-xs font-medium border rounded-md transition-colors 
                  ${isBranchDropdownOpen 
                    ? "bg-[#30363d] border-[#8b949e] text-[#e6edf3]" 
                    : "bg-[#21262d] border-[#30363d] text-[#7d8590] hover:bg-[#30363d] hover:text-[#e6edf3]"
                  }`}
                title="List branches containing this commit"
              >
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" className="octicon octicon-git-branch mr-1 fill-gray-400">
                  <path d="M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Zm-6 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm8.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"></path>
                </svg>
                
                <span className="max-w-[100px] truncate">
                  {branches.length === 1 ? branches[0] : `${branches.length} branches`}
                </span>
                
                {/* Caret Icon */}
                <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="12" height="12" fill="currentColor" className="opacity-60">
                  <path d="M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z"></path>
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isBranchDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 z-50 bg-[#161b22] border border-[#30363d] rounded-md shadow-xl overflow-hidden flex flex-col">
                  <div className="px-3 py-2 text-xs font-bold text-[#e6edf3] border-b border-[#30363d] bg-[#161b22]">
                    Branches containing this commit
                  </div>
                  <ul className="max-h-60 overflow-y-auto py-1">
                    {branches.map((branch) => (
                      <li key={branch}>
                        <button 
                          onClick={handleGetCommitsFromBranch}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-[#c9d1d9] hover:bg-[#30363d] hover:text-[#58a6ff] transition-colors group w-full"
                        >
                          {/* Branch icon inside list */}
                          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" className="octicon octicon-git-branch mr-1 fill-gray-400">
                            <path d="M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Zm-6 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm8.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"></path>
                          </svg>
                          <span className="truncate font-mono">{branch}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Hash button group */}
          <div className="flex items-center h-full text-xs border border-[#30363d] rounded-md bg-[#21262d] overflow-hidden">
            {/* Hash button */}
            <button
              className="px-3 h-full font-mono text-[#7d8590] hover:text-[#4493f8] hover:underline border-r border-[#30363d] transition-colors"
              title={`View commit details for ${shortHash}`}
            >
              {shortHash}
            </button>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="flex items-center justify-center w-8 h-full hover:bg-[#30363d] transition-colors group border-l border-transparent"
              title="Copy full SHA"
              aria-label="Copy full SHA"
            >
              {copied ? (
                // Check icon (Green)
                <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="14" height="14" fill="#3fb950">
                  <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
                </svg>
              ) : (
                // Copy icon (Grey -> White on hover)
                <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="14" height="14" fill="#7d8590" className="group-hover:fill-[#e6edf3]">
                  <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
                  <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
};