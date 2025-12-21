import { useState, useRef, useEffect } from "react";
import { Repository } from "@sharedTypes/Repository";
import { CaretIcon, ForkIcon } from "../icons"; // Assuming icons are available

interface ForkDropdownProps {
  forks: Repository[];
  fetchCommits: (params: any) => Promise<void>;
  fetchBranches: (params: any) => Promise<void>;
  fetchForks: (params: any) => Promise<void>
}

const ITEMS_PER_PAGE = 7; // Number of forks per page

export const ForkDropdown = ({ forks, fetchCommits, fetchBranches, fetchForks }: ForkDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reset page when opening or closing
  useEffect(() => {
    if (!isOpen) setCurrentPage(1);
  }, [isOpen]);

  // Close when clicking outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPages = Math.ceil(forks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentForks = forks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleForkSelect = (repoUrl: string) => {
    fetchCommits({ url: repoUrl });
    fetchBranches(repoUrl);
    fetchForks(repoUrl);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative h-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 h-full text-xs font-medium border rounded-md transition-colors 
          ${isOpen 
            ? "bg-[#30363d] border-[#8b949e] text-[#e6edf3]" 
            : "bg-[#21262d] border-[#30363d] text-[#7d8590] hover:bg-[#30363d] hover:text-[#e6edf3]"
          }`}
      >
        <span className="flex items-center gap-1">
          <ForkIcon />
          {forks.length} forks
        </span>
        <CaretIcon />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 z-50 bg-[#161b22] border border-[#30363d] rounded-md shadow-xl flex flex-col">
          <div className="px-3 py-2 text-xs font-bold text-[#e6edf3] border-b border-[#30363d]">
            Select a fork to view commits
          </div>

          <ul className="py-1">
            {currentForks.map((fork) => (
              <li key={fork.url}>
                <button
                  onClick={() => handleForkSelect(fork.url)}
                  className="w-full text-left px-3 py-2 text-xs text-[#c9d1d9] hover:bg-[#30363d] hover:text-[#58a6ff] transition-colors flex flex-col"
                >
                  <span className="font-semibold truncate">{fork.name}</span>
                  <span className="text-[10px] text-[#8b949e] truncate">{fork.url}</span>
                </button>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-[#30363d] bg-[#0d1117]">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="text-[10px] text-[#58a6ff] disabled:text-[#484f58] hover:underline cursor-pointer disabled:cursor-default"
              >
                Previous
              </button>
              <span className="text-[10px] text-[#8b949e]">
                {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="text-[10px] text-[#58a6ff] disabled:text-[#484f58] hover:underline cursor-pointer disabled:cursor-default"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};