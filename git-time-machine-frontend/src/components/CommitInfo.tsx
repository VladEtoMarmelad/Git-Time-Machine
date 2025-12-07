import { Commit } from "@sharedTypes/Commit";
import { useState } from "react";
import Link from "next/link";

interface CommitInfoProps {
  commit: Commit;
  repoUrl: string;
}

export const CommitInfo = ({ commit, repoUrl }: CommitInfoProps) => {
  const [copied, setCopied] = useState(false);

  // GitHub shows the first 7 characters of the hash
  const shortHash = commit.hash.slice(0, 7);

  // Date formatting
  const dateObj = new Date(commit.date);
  const formattedDate = new Intl.DateTimeFormat("en-EN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(dateObj);

  const handleCopy = () => {
    navigator.clipboard.writeText(commit.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-[#0d1117] font-sans mb-4">
      <div className="flex items-start justify-between p-4 border border-[#21262d] rounded-[5px] transition-colors">
        
        {/* LEFT COLUMN: Message and metadata */}
        <div className="flex flex-col gap-1 pr-4">
          {/* Commit message */}
          <Link 
            href={`${repoUrl}/commit/${commit.hash}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <h3 className="text-[16px] font-semibold text-[#e6edf3] hover:text-[#4493f8] hover:underline cursor-pointer leading-tight">
              {commit.message}
            </h3>
          </Link>

          {/* Author and date */}
          <div className="flex items-center gap-2 mt-1 text-xs text-[#7d8590]">
            <Link 
              href={`https://github.com/${commit.author}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-[#e6edf3] hover:underline hover:text-[#4493f8] cursor-pointer"
            >
              {commit.author}
            </Link>
            <span>committed on {formattedDate}</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Hash and buttons */}
        <div className="flex items-center gap-2 pl-2">
          {/* Hash button group */}
          <div className="flex items-center h-8 text-xs border border-[#30363d] rounded-md bg-[#21262d] overflow-hidden">
            {/* Hash button */}
            <button 
              className="px-3 h-full font-mono text-[#7d8590] hover:text-[#4493f8] hover:underline border-r border-[#30363d] transition-colors"
              title={`View commit details for ${shortHash}`}
            >
              {shortHash}
            </button>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="flex items-center justify-center w-8 h-full hover:bg-[#30363d] transition-colors group border-l border-transparent"
              title="Copy full SHA"
              aria-label="Copy full SHA"
            >
              {copied ? (
                // Check icon (Green)
                <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="14" height="14" fill="#3fb950">
                  <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
                </svg>
              ) : (
                // Copy icon (Grey -> White on hover)
                <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="14" height="14" fill="#7d8590" className="group-hover:fill-[#e6edf3]">
                  <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
                  <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};