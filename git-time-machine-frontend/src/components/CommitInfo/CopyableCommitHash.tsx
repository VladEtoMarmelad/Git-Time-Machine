import { useState } from "react";
import { CheckIcon, CopyIcon } from "../icons"

interface CopyableCommitHashProps {
  hash: string;
}

export const CopyableCommitHash = ({ hash }: CopyableCommitHashProps) => {

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortHash = hash.slice(0, 7);

  return (
    <div className="flex items-center h-full text-xs border border-[#30363d] rounded-md bg-[#21262d] overflow-hidden">
      <button
        className="px-3 h-full font-mono text-[#7d8590] hover:text-[#4493f8] hover:underline border-r border-[#30363d] transition-colors"
        title={`View commit details for ${shortHash}`}
      >
        {shortHash}
      </button>
    
      <button
        onClick={handleCopy}
        className="flex items-center justify-center w-8 h-full hover:bg-[#30363d] transition-colors group border-l border-transparent"
        title="Copy full SHA"
        aria-label="Copy full SHA"
      >
        {copied ? <CheckIcon />: <CopyIcon className="group-hover:fill-[#e6edf3]" />}
      </button>
    </div>
  )
}