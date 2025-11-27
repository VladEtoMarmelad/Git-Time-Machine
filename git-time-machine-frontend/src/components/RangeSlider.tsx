"use client"

import { useMemo } from 'react';
import { Commit } from '@sharedTypes/Commit';

interface RangeSliderProps {
  commits: Commit[];
  selectedCommitIndex: number;
  setSelectedCommitIndex: (commitIndex: number) => void
}

export const RangeSlider = ({commits, selectedCommitIndex, setSelectedCommitIndex}: RangeSliderProps) => {
  const getDates = (commits: Commit[]): string[] => {
    const dates: string[] = []

    commits.forEach((commit: Commit) => {
      dates.push(commit.date)
    })

    return dates
  }

  const dates = useMemo(() => getDates(commits), [commits])
  const maxIndex = dates.length - 1;

  // Helper for formatting dates (from string to readable format)
  const formatDate = (dateString: string, full = false) => {
    const date = new Date(dateString);
    if (full) {
      // Full format for title
      return new Intl.DateTimeFormat("en-EN", {
        day: "numeric", month: "long", year: "numeric",
        hour: "numeric", minute: "numeric", second: "numeric"
      }).format(date);
    }
    // Short format for labels
    return new Intl.DateTimeFormat("en-EN", {
      day: "2-digit", month: "short"
    }).format(date);
  };

  // Calculating the fill percentage for a gradient
  const getBackgroundSize = () => {
    const percentage = (selectedCommitIndex / maxIndex) * 100;
    return { backgroundSize: `${percentage}% 100%` };
  };

  return (
    <div className="flex min-h-[200px] w-full items-center justify-center bg-[#0d1117] text-gray-300">
      <div className="w-full max-w-2xl space-y-4">
        
        {/* Top: Selected value */}
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between items-end">
            <label className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">
              History Checkpoint
            </label>
            <span className="text-xs text-[#8b949e]">
              {selectedCommitIndex + 1} / {dates.length}
            </span>
          </div>
          {/* Displays the full date of the currently selected index */}
          <div className="text-xl font-semibold text-white">
            {formatDate(dates[selectedCommitIndex], true)}
          </div>
        </div>

        {/* Slider */}
        <div className="relative w-full h-10 flex items-center">
          
          {/* Background track with dots (Layer "below") */}
          <div className="absolute w-full h-2 bg-[#30363d] rounded-lg pointer-events-none flex items-center">
             {dates.map((dateStr, index) => {
                // Calculating the position of a point in percentage
                const percentage = (index / maxIndex) * 100;
                const isActive = selectedCommitIndex >= index;
                const isCurrent = selectedCommitIndex === index;

                return (
                  <div
                    key={dateStr}
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
            value={selectedCommitIndex}
            onChange={(e) => setSelectedCommitIndex(Number(e.target.value))}
            style={getBackgroundSize()}
            className="
              absolute w-full z-20 h-2 appearance-none rounded-lg bg-transparent cursor-pointer
              
              /* Синяя полоса (Visual Fill) */
              bg-gradient-to-r from-[#1f6feb] to-[#1f6feb] bg-no-repeat
              
              focus:outline-none focus:ring-2 focus:ring-[#1f6feb] focus:ring-offset-2 focus:ring-offset-[#0d1117]

              /* Webkit Thumb */
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-[#1f6feb]
              [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(31,111,235,0.5)]
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:duration-150
              [&::-webkit-slider-thumb]:hover:scale-110

              /* Firefox Thumb */
              [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:border-none
            "
          />

          {/* Date Labels (Bottom Layer) */}
          <div className="absolute top-8 w-full h-6 select-none">
             {dates.map((dateStr, index) => {
                const percentage = (index / maxIndex) * 100;
                
                const isFirst = index === 0;
                const isLast = index === maxIndex;
                const isSelected = index === selectedCommitIndex;

                // Display logic: show the label only if it is selected or the last one
                const shouldShow = isFirst || isLast || isSelected;

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedCommitIndex(index)}
                    className={`
                      absolute text-xs transform -translate-x-1/2 cursor-pointer transition-colors duration-200
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
          Drag the slider to select a restore point.
        </p>
      </div>
    </div>
  );
};