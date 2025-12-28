import { BranchIcon } from "@/components/icons"

export const BranchBadge = ({selectedBranch}: {selectedBranch: string}) => {
  return (
    <section 
      className="hidden md:flex items-center h-full px-2.5 text-xs font-medium text-[#4493f8] bg-[#388bfd1a] border border-[#388bfd66] rounded-md mr-1"
      title={`Current active branch: ${selectedBranch}`}
    >
      <BranchIcon className="w-3.5 h-3.5 mr-1.5 fill-[#4493f8]" />
      <span className="max-w-[120px] truncate font-mono">{selectedBranch}</span>
    </section>
  )
}