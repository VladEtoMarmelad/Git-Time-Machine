import { formatDate } from "@/utils/formatDate";
import { Commit } from "@sharedTypes/index";
import { useMemo } from "react";

interface RangeSliderProps {
  commits: Commit[];
  localIndex: number;
  setLocalIndex: (newLocalIndex: number) => void;
  setSelectedCommitIndex: (commitIndex: number) => void
}

export const RangeSlider = ({ commits, localIndex, setLocalIndex, setSelectedCommitIndex }: RangeSliderProps) => {  
  const dates = useMemo(() => commits.map(c => c.date), [commits]);
  const maxIndex = dates.length - 1;

  // Gradient calculation depends on the local index
  const getBackgroundSize = () => {
    const percentage = maxIndex > 0 ? (localIndex / maxIndex) * 100 : 0;
    return { backgroundSize: `${percentage}% 100%` };
  };

  // Commit value when the slider is released
  const handleCommitChange = () => {
    setSelectedCommitIndex(localIndex);
  };

  return (
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
  );
};