import { Commit } from "@sharedTypes/index";
import { useMemo, useState, useEffect, useRef } from 'react';
import { formatDate } from '@/utils/formatDate';

interface CommitSearchProps {
  commits: Commit[];
  setSelectedCommitIndex: (commitIndex: number) => void
}

export const CommitSearch = ({commits, setSelectedCommitIndex}: CommitSearchProps) => {
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Click outside handler to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter commits based on search query
  const filteredCommits = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return commits
      .map((commit, index) => ({ ...commit, index }))
      .filter(commit => 
        commit.message.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 8); // Limit results for better UI
  }, [searchQuery, commits]);

  return (
    <div className="relative w-full max-w-md mt-3" ref={searchRef}>
      {/* Search Results Dropdown (now pops UP) */}
      {isSearchFocused && searchQuery.trim() !== "" && (
        <div className="absolute bottom-full mb-2 z-50 w-full bg-[#161b22] border border-[#30363d] rounded-md shadow-2xl overflow-hidden">
          {filteredCommits.length > 0 ? (
            filteredCommits.map((commit) => (
              <button
                key={commit.index}
                onClick={() => {
                  setSelectedCommitIndex(commit.index);
                  setSearchQuery("");
                  setIsSearchFocused(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-[#1f6feb] hover:text-white border-b border-[#30363d] last:border-none transition-colors"
              >
                <div className="text-sm font-medium truncate">{commit.message}</div>
                <div className="text-[10px] opacity-70">{formatDate(commit.date, true)}</div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-[#8b949e] italic text-center">
              No matching commits found
            </div>
          )}
        </div>
      )}

      <div className="relative group">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e] group-focus-within:text-[#1f6feb]"
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search commits by message..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-1.5 pl-10 pr-4 text-sm text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:ring-1 focus:ring-[#1f6feb] focus:border-[#1f6feb] transition-all"
        />
      </div>
    </div>
  );
};