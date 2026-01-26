"use client"

import { useState, useEffect } from 'react';
import { Commit } from '@sharedTypes/index';
import { CommitSearch } from './CommitSearch';
import { RangeSlider } from './RangeSlider';
import { CurrentCommitInfo } from './CurrentCommitInfo';

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
        <CommitSearch 
          commits={commits}
          setSelectedCommitIndex={setSelectedCommitIndex}
        />

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