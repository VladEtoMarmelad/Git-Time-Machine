"use client"

import { useMemo, useState, useEffect, useRef } from 'react';
import { Commit } from '@sharedTypes/index';
import { formatDate } from '@/utils/formatDate';

interface RangeSliderProps {
  commits: Commit[];
  selectedCommitIndex: number;
  setSelectedCommitIndex: (commitIndex: number) => void
}

export const RangeSlider = ({ commits, selectedCommitIndex, setSelectedCommitIndex }: RangeSliderProps) => {
  // Local state for smooth slider movement
  const [localIndex, setLocalIndex] = useState(selectedCommitIndex);
  
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Sync local state if prop changes externally (via buttons or input)
  useEffect(() => {
    setLocalIndex(selectedCommitIndex);
  }, [selectedCommitIndex]);

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

  const dates = useMemo(() => commits.map(c => c.date), [commits]);
  const maxIndex = dates.length - 1;

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

  // Gradient calculation depends on the local index
  const getBackgroundSize = () => {
    const percentage = maxIndex > 0 ? (localIndex / maxIndex) * 100 : 0;
    return { backgroundSize: `${percentage}% 100%` };
  };

  // Handle manual input field changes (updates immediately)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") return;

    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1 && num <= dates.length) {
      setSelectedCommitIndex(num - 1);
    }
  };

  // Commit value when the slider is released
  const handleCommitChange = () => {
    setSelectedCommitIndex(localIndex);
  };

  return (
    <div className="flex min-h-[200px] w-full items-center justify-center bg-[#0d1117] text-gray-300">
      <div className="w-full max-w-7xl space-y-4">
        
        {/* Search Bar Section */}
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

        {/* Top: Selected value */}
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

        {/* Slider Container */}
        <div className="relative w-full h-10 flex items-center">
          
          <div className="absolute w-full h-2 bg-[#30363d] rounded-lg pointer-events-none flex items-center">
            {dates.map((dateStr, index) => {
              const percentage = (index / maxIndex) * 100;
              const isActive = localIndex >= index;
              const isCurrent = localIndex === index;

              return (
                <div
                  key={`${index}-${dateStr}`}
                  className={`absolute h-2 w-2 rounded-full transition-colors duration-200 -ml-1
                    ${isActive ? 'bg-[#1f6feb]' : 'bg-[#484f58]'}
                    ${isCurrent ? 'scale-150' : ''} 
                  `}
                  style={{ left: `${percentage}%` }}
                />
              );
            })}
          </div>

          <input
            type="range"
            min={0}
            max={maxIndex}
            step={1}
            value={localIndex}
            onChange={(e) => setLocalIndex(Number(e.target.value))}
            onMouseUp={handleCommitChange}
            onTouchEnd={handleCommitChange}
            onKeyUp={handleCommitChange}
            style={getBackgroundSize()}
            className="
              absolute w-full z-20 h-2 appearance-none rounded-lg bg-transparent cursor-pointer
              bg-gradient-to-r from-[#1f6feb] to-[#1f6feb] bg-no-repeat
              focus:outline-none focus:ring-2 focus:ring-[#1f6feb] focus:ring-offset-2 focus:ring-offset-[#0d1117]
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1f6feb] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(31,111,235,0.5)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none
            "
          />

          {/* Date Labels */}
          <div className="absolute top-8 w-full h-6 select-none">
            {dates.map((dateStr, index) => {
              const percentage = (index / maxIndex) * 100;
              const isFirst = index === 0;
              const isLast = index === maxIndex;
              const isSelected = index === localIndex;
              const shouldShow = isFirst || isLast || isSelected;

              return (
                <div
                  key={`label-${index}`}
                  onClick={() => setSelectedCommitIndex(index)}
                  className={`
                    absolute text-xs transform -translate-x-1/2 cursor-pointer transition-all duration-200
                    ${isSelected ? 'text-white font-bold top-[-5px]' : 'text-[#8b949e]'}
                    ${!shouldShow ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                  `}
                  style={{ left: `${percentage}%` }}
                >
                  {formatDate(dateStr)}
                </div>
              );
            })}
          </div>
        </div>
        
        <p className="text-xs text-[#8b949e]">
          Drag to select, search by message, or release to apply.
        </p>
      </div>
    </div>
  );
};