import { RefObject } from "react";
import { BranchIcon, CaretIcon, CheckIcon } from "@/components/icons";

interface BranchDropdownProps {
  branches: string[];
  selectedBranch: string;
  isBranchDropdownOpen: boolean;
  dropdownRef: RefObject<HTMLDivElement | null>
  repoUrl: string;
  fetchCommits: (params: any) => Promise<void>;
  setSelectedBranch: (branchName: string) => void;
  setIsBranchDropdownOpen: (newValue: boolean) => void
}

export const BranchDropdown = ({branches, selectedBranch, isBranchDropdownOpen, dropdownRef, repoUrl, fetchCommits, setSelectedBranch, setIsBranchDropdownOpen}: BranchDropdownProps) => {

  const handleBranchSelect = (branchName: string) => {
    fetchCommits({
      url: repoUrl,
      branch: branchName,
    });
    setSelectedBranch(branchName);
    setIsBranchDropdownOpen(false);
  };

    const dropdownTriggerClass = isBranchDropdownOpen
    ? "bg-[#30363d] border-[#8b949e] text-[#e6edf3]"
    : "bg-[#21262d] border-[#30363d] text-[#7d8590] hover:bg-[#30363d] hover:text-[#e6edf3]";

  return (
    <div ref={dropdownRef} className="relative h-full"  style={{scrollbarColor: 'gray #161b22'}}>
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

      {isBranchDropdownOpen &&
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
                        ? "bg-[#30363d] text-[#58a6ff]" // Selected branch styles
                        : "text-[#c9d1d9] hover:bg-[#30363d] hover:text-[#58a6ff]" // Regular styles
                    }`}
                  >
                    <BranchIcon
                      className={`mr-1 ${isSelected ? "fill-[#58a6ff]" : "fill-gray-400"}`}
                    />
                    <span className="truncate font-mono flex-1 text-left">{branch}</span>

                    {/* Show a check if branch is selected */}
                    {isSelected && <CheckIcon className="w-3 h-3 fill-[#58a6ff]" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      }
    </div>
  );
};