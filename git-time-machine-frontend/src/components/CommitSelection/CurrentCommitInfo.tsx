import { formatDate } from "@/utils/formatDate";
import { Commit } from "@sharedTypes/Commit";
import { useMemo } from "react";

interface CurrentCommitInfoProps {
  commits: Commit[];
  selectedCommitIndex: number;
  localIndex: number;
  setSelectedCommitIndex: (commitIndex: number) => void
}

export const CurrentCommitInfo = ({ commits, selectedCommitIndex, localIndex, setSelectedCommitIndex }: CurrentCommitInfoProps) => {    
  const dates = useMemo(() => commits.map(c => c.date), [commits]);
  const maxIndex = dates.length - 1;

  // Handle manual input field changes (updates immediately)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") return;

    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1 && num <= dates.length) {
      setSelectedCommitIndex(num - 1);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">
          History Checkpoint
        </label>
        <div className="text-xs text-[#8b949e] flex items-center">
          <div className="flex items-center bg-[#010409] border border-[#30363d] rounded-md">
            <input 
              type="number"
              value={localIndex + 1}
              onChange={handleInputChange}
              className="w-12 text-center bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="flex flex-col text-gray-400">
              <button 
                onClick={() => setSelectedCommitIndex(Math.min(selectedCommitIndex + 1, maxIndex))} 
                className="px-1 hover:bg-[#1f6feb] hover:text-white rounded-tr-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button 
                onClick={() => setSelectedCommitIndex(Math.max(selectedCommitIndex - 1, 0))} 
                className="px-1 hover:bg-[#1f6feb] hover:text-white rounded-br-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
          <span className="ml-2">/ {dates.length}</span>
        </div>
      </div>
      <div className="text-xl font-semibold text-white">
        {dates.length > 0 ? (
          <div className="flex flex-col">
            <span>{formatDate(dates[localIndex], true)}</span>
            <span className="text-sm font-normal text-[#8b949e] mt-1 italic truncate max-w-2xl">
              "{commits[localIndex]?.message}"
            </span>
          </div>
        ) : "No commits found"}
      </div>
    </div>
  )
}