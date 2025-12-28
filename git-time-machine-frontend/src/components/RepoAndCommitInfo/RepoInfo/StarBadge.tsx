import { StarIcon } from "@/components/icons";

export const StarBadge = ({starsAmount}: {starsAmount: number}) => {

  const formatCount = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="inline-flex items-center overflow-hidden rounded-md border border-[#30363d] bg-[#0d1117] text-sm font-medium">
      <button 
        className="flex items-center gap-2 bg-[#21262d] px-3 py-1.5 text-[#c9d1d9] transition-colors hover:bg-[#30363d]"
        aria-label="Star this repository"
      >
        <StarIcon className="text-[#8b949e]" />
        <span>Star</span>
      </button>

      <div className="border-l border-[#30363d] px-3 py-1.5 text-[#c9d1d9] bg-[#21262d]">
        {formatCount(starsAmount)}
      </div>
    </div>
  )
}