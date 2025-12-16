interface MarkdownPreviewToggle {
  isMarkdown: boolean;
  viewMode: "diff"|"preview"
  setViewMode: (newValue: "diff"|"preview") => void
}

export const MarkdownPreviewToggle = ({ isMarkdown, viewMode, setViewMode }: MarkdownPreviewToggle) => {
  return isMarkdown ? (
    <div className="flex items-center border-b border-[#30363d] bg-[#0d1117] px-3 py-2 gap-2">
      <button
        onClick={() => setViewMode("diff")}
        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
          viewMode === "diff"
            ? 'bg-[#1f6feb] text-white border-[#1f6feb]'
            : 'bg-transparent text-[#c9d1d9] border-transparent hover:bg-[#21262d]'
        }`}
      >
        Code
      </button>
      <button
        onClick={() => setViewMode("preview")}
        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
          viewMode === "preview"
            ? 'bg-[#1f6feb] text-white border-[#1f6feb]'
            : 'bg-transparent text-[#c9d1d9] border-transparent hover:bg-[#21262d]'
        }`}
      >
        Preview
      </button>
    </div>
  ) : null;
};