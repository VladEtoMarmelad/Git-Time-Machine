import { useState, useRef, useEffect } from "react";
import { Repository } from "@sharedTypes/Repository";
import { CaretIcon, ForkIcon } from "../icons";

interface ForkDropdownProps {
  forks: Repository[];
  currentRepoUrl: string; 
  fetchCommits: (params: any) => Promise<void>;
  fetchBranches: (params: any) => Promise<void>;
  fetchForks: (params: any) => Promise<void>;
  setRepoUrl: (newRepoUrl: string) => void;
}

const ITEMS_PER_PAGE = 10;

export const ForkDropdown = ({ 
  forks, 
  currentRepoUrl,
  fetchCommits, 
  fetchBranches, 
  fetchForks, 
  setRepoUrl 
}: ForkDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [maxForksAmount, setForksAmount] = useState(50);
  const [maxForksAmountInputValue, setMaxForksAmountInputValue] = useState(String(maxForksAmount));
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMaxForksAmountInputValue(String(maxForksAmount));
  }, [isOpen, maxForksAmount]);

  useEffect(() => {
    if (!isOpen) setCurrentPage(1);
  }, [isOpen]);

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

  const handleApplyRefetch = () => {
    const amount = parseInt(maxForksAmountInputValue) || 10;
    const clampedAmount = Math.max(1, Math.min(amount, 1000)); // Limit from 1 to 1000
    
    setForksAmount(clampedAmount);
    setMaxForksAmountInputValue(String(clampedAmount));
    
    fetchForks({
      url: currentRepoUrl,
      maxForksAmount: clampedAmount
    });
  };

  const handleForkSelect = (repoUrl: string) => {
    fetchCommits({ url: repoUrl });
    fetchBranches(repoUrl);
    fetchForks({ url: repoUrl, maxForksAmount });
    setRepoUrl(repoUrl);
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
        <div className="absolute right-0 top-full mt-2 w-72 z-50 bg-[#161b22] border border-[#30363d] rounded-md shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 text-xs font-bold text-[#e6edf3] border-b border-[#30363d] bg-[#161b22]">
            Select a fork
          </div>

          {/* Controls Panel */}
          <div className="p-3 border-b border-[#30363d] bg-[#0d1117] flex items-center gap-2">
            <div className="flex flex-col flex-1 gap-1">
              <label htmlFor="fork-amount" className="text-[10px] text-[#8b949e]">Fetch amount:</label>
              <input
                id="fork-amount"
                type="number"
                value={maxForksAmountInputValue}
                onChange={(e) => setMaxForksAmountInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyRefetch()}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-xs text-[#c9d1d9] focus:border-[#58a6ff] focus:outline-none"
              />
            </div>
            <button
              onClick={handleApplyRefetch}
              className="mt-4 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-[11px] font-semibold rounded-md transition-colors"
            >
              Update
            </button>
          </div>

          {/* Forks List */}
          <ul className="max-h-64 overflow-y-auto py-1 custom-scrollbar">
            {currentForks.length > 0 ? (
              currentForks.map((fork) => (
                <li key={fork.url}>
                  <button
                    onClick={() => handleForkSelect(fork.url)}
                    className="w-full text-left px-3 py-2 text-xs text-[#c9d1d9] hover:bg-[#30363d] hover:text-[#58a6ff] transition-colors flex flex-col"
                  >
                    <span className="font-semibold truncate">{fork.name}</span>
                    <span className="text-[10px] text-[#8b949e] truncate">{fork.url}</span>
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-4 text-center text-xs text-[#8b949e]">No forks found</li>
            )}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-[#30363d] bg-[#161b22]">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="text-[10px] text-[#58a6ff] disabled:text-[#484f58] hover:underline cursor-pointer disabled:cursor-default"
              >
                Previous
              </button>
              <span className="text-[10px] text-[#8b949e]">
                {currentPage} / {totalPages}
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