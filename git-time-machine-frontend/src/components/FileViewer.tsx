import { JobStatus } from "@/types/JobStatus"
import { File } from "@sharedTypes/File";

interface FileViewerProps {
  fileStatus: JobStatus;
  fileError: string|null;
  fileContent: File|null;
  chosenFilePath: string|null
}

export const FileViewer = ({fileStatus, fileError, fileContent, chosenFilePath}: FileViewerProps) => {
  return (
    <section style={{ scrollbarColor: 'gray #010409', scrollbarWidth: 'thin' }}>
      <h2 className="text-lg font-semibold mb-2">File review</h2>
      <div className="bg-[#010409] border border-[#30363d] rounded-md p-4 text-sm text-[#c9d1d9] min-h-[60vh]">
        <pre className="whitespace-pre-wrap break-words max-h-[60vh] overflow-auto font-mono">
          {fileStatus === "processing" && "Loading file content..."}
          {fileStatus === "failed" && <span className="text-red-500">{fileError}</span>}
          {fileStatus !== "processing" && fileContent?.content}
          {fileStatus === "idle" && !chosenFilePath && "Select a file to view its content."}
        </pre>
      </div>
    </section>
  )
}