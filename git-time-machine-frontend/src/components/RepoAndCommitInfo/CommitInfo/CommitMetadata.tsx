import { Commit } from "@sharedTypes/index";
import Link from "next/link"

interface CommitMetadataProps {
  commit: Commit;
  repoUrl: string
}

export const CommitMetadata = ({ commit, repoUrl }: CommitMetadataProps) => {

  const formattedDate = new Intl.DateTimeFormat("en-EN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(commit.date));

  return (
    <div className="flex flex-col gap-1 pr-4">
      <Link
        href={`${repoUrl}/commit/${commit.hash}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <h3 className="text-[16px] font-semibold text-[#e6edf3] hover:text-[#4493f8] hover:underline cursor-pointer leading-tight">
          {commit.message}
        </h3>
      </Link>

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
  )
}