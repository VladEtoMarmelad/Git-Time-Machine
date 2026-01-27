"use client"

import { useState, useEffect } from 'react';
import { Commit } from '@sharedTypes/index';
import { RangeSlider } from './RangeSlider';
import { CurrentCommitInfo } from './CurrentCommitInfo';
import { SearchInput } from '../SearchInput';
import { formatDate } from '@/utils/formatDate';

interface CommitSelectionProps {
  commits: Commit[];
  selectedCommitIndex: number;
  setSelectedCommitIndex: (commitIndex: number) => void
}

export const CommitSelection = ({ commits, selectedCommitIndex, setSelectedCommitIndex }: CommitSelectionProps) => {
  // Local state for smooth slider movement
  const [localIndex, setLocalIndex] = useState(selectedCommitIndex);

  // Sync local state if prop changes externally (via buttons or input)
  useEffect(() => {
    setLocalIndex(selectedCommitIndex);
  }, [selectedCommitIndex]);

  return (
    <div className="flex min-h-[200px] w-full items-center justify-center bg-[#0d1117] text-gray-300">
      <div className="w-full max-w-7xl space-y-4">
        
        {/* Commit Search Bar  */}
        <div className="mt-3 max-w-md">
          <SearchInput
            items={commits.map((c, i) => ({ ...c, originalIndex: i }))}
            dropdownDirection="up" // Commits pop UP
            placeholder="Search commits..."
            onSelect={(item) => setSelectedCommitIndex(item.originalIndex)}
            filterFn={(item, query) => item.message.toLowerCase().includes(query.toLowerCase())}
            renderItem={(item) => (
              <>
                <div className="text-sm font-medium truncate">{item.message}</div>
                <div className="text-[10px] opacity-70 group-hover:text-blue-100">{formatDate(item.date, true)}</div>
              </>
            )}
          />
        </div>

        {/* Some info about selected commit */}
        <CurrentCommitInfo 
          commits={commits}
          selectedCommitIndex={selectedCommitIndex}
          localIndex={localIndex}
          setSelectedCommitIndex={setSelectedCommitIndex}
        />

        {/* Slider */}
        <RangeSlider 
          commits={commits}
          localIndex={localIndex}
          setLocalIndex={setLocalIndex}
          setSelectedCommitIndex={setSelectedCommitIndex}
        />
        
        <p className="text-xs text-[#8b949e]">
          Drag to select, search by message, or release to apply.
        </p>

      </div>
    </div>
  );
};