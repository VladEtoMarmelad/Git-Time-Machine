import { StarIcon } from "@/components/icons";

export const StarBadge = ({starsAmount}: {starsAmount: number}) => {

  const formatCount = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <section 
      className="hidden md:flex items-center h-full px-2.5 text-xs font-medium text-[#7d8590] bg-[#388bfd1a] border border-[#388bfd66] rounded-md mr-1 bg-[#21262d] border-[#30363d] text-[#7d8590] hover:bg-[#30363d] hover:text-[#e6edf3]"
    >
      <StarIcon className="mr-1 fill-gray-400" />
      <span className="max-w-[120px] truncate font-mono max-w-[100px] truncate ">{formatCount(starsAmount)}</span>
    </section>
  )
}