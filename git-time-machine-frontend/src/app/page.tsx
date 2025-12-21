"use client"

import { useEffect, useState } from "react";
import { FileTree } from "@/components/FileTree/FileTree";
import { RangeSlider } from "@/components/RangeSlider";
import { buildFileTree } from "@/utils/buildFileTree";
import { File } from "@sharedTypes/File";
import { Commit } from "@sharedTypes/Commit"
import { useJobPolling } from "@/hooks/useJobPolling";
import { gitApi } from "@/utils/gitApi";
import { RepoUrlInput } from "@/components/RepoUrlInput";
import { FileViewer } from "@/components/FileViewer/index";
import { CommitInfo } from "@/components/CommitInfo/index";
import { Repository } from "@sharedTypes/Repository";

export default function Home() {
  const [selectedCommitIndex, setSelectedCommitIndex] = useState<number>(0);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [chosenFilePath, setChosenFilePath] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState<string>("");

  // Job for commits
  const { 
    start: fetchCommits, 
    status: commitsStatus, 
    result: commits, 
    error: commitsError 
  } = useJobPolling<Commit[]>({
    startJobFn: (params) => gitApi.startCommitsJob(params.url, params.branch),
    pollJobFn: gitApi.pollCommitsJob
  });

  // Job for branches
  const { 
    start: fetchBranches, 
    status: branchesStatus, 
    result: branches, 
    error: branchesError 
  } = useJobPolling<string[]>({
    startJobFn: (url) => gitApi.startBranchesJob(url),
    pollJobFn: gitApi.pollBranchesJob
  });

  // Job for forks
  const { 
    start: fetchForks, 
    status: forksStatus, 
    result: forks, 
    error: forksError 
  } = useJobPolling<Repository[]>({
    startJobFn: (url) => gitApi.startForksJob(url),
    pollJobFn: gitApi.pollForksJob
  });

  // Job for file
  const { 
    start: fetchFile, 
    status: fileStatus, 
    result: fileContent, 
    error: fileError 
  } = useJobPolling<File>({
    startJobFn: (params) => gitApi.startFileJob(params.url, params.hash, params.path),
    pollJobFn: gitApi.pollFileJob
  }); 

  // Effect: Upload file when commit is changed or new file is selected
  useEffect(() => {
    if (chosenFilePath && commits && commits[selectedCommitIndex]) {
      fetchFile({
        url: repoUrl,
        hash: commits[selectedCommitIndex].hash,
        path: chosenFilePath
      });
    }
  }, [chosenFilePath, selectedCommitIndex, commits]); 

  return (
    <div className="flex min-h-screen font-sans bg-[#0b1117] text-[#c9d1d9]">
      <div className="flex w-full">
        <div className="flex-shrink-0">
          {commitsStatus === "processing" && <div className="p-4">Analyzing repository...</div>}
          {commitsStatus === "failed" && <div className="p-4 text-red-500">Error: {commitsError}</div>}
          {(commits && commits[selectedCommitIndex]?.files) &&
            <FileTree
              fileTreeItems={buildFileTree(commits[selectedCommitIndex].files)}
              choosedFile={chosenFilePath}
              onSelect={(path) => setChosenFilePath(path)}
            />
          }
        </div>

        <main className="flex-1 p-6 w-px">
          <RepoUrlInput 
            commitsStatus={commitsStatus}
            repoUrl={repoUrl}
            setRepoUrl={setRepoUrl}
            setChosenFilePath={setChosenFilePath}
            fetchCommits={fetchCommits}
            fetchBranches={fetchBranches}

            fetchForks={fetchForks}
          />

          {commits &&
            <CommitInfo 
              commit={commits[selectedCommitIndex]}
              repoUrl={repoUrl}
              branches={branches}
              selectedBranch={selectedBranch}
              forks={forks}
              fetchCommits={fetchCommits}
              fetchBranches={fetchBranches}
              fetchForks={fetchForks}
              setSelectedBranch={setSelectedBranch}
              
            />
          }

          <FileViewer 
            fileStatus={fileStatus}
            fileError={fileError}
            fileContent={fileContent}
            chosenFilePath={chosenFilePath}
          />

          {commits &&
            <RangeSlider
              commits={commits}
              selectedCommitIndex={selectedCommitIndex}
              setSelectedCommitIndex={setSelectedCommitIndex}
            />
          }
        </main>
      </div>
    </div>
  );
}
