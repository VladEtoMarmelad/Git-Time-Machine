"use client"

import { useEffect, useRef, useState } from "react";
import { FileTree } from "@/components/FileTree/FileTree";
import { CommitSelection } from "@/components/CommitSelection";
import { buildFileTree } from "@/utils/buildFileTree";
import { File, Commit, Repository} from "@sharedTypes/index";
import { useJobPolling } from "@/hooks/useJobPolling";
import { gitApi } from "@/utils/gitApi";
import { RepoUrlInput } from "@/components/RepoUrlInput";
import { FileViewer } from "@/components/FileViewer/index";
import { RepoAndCommitInfo } from "@/components/RepoAndCommitInfo/index";

export default function Home() {
  const [selectedCommitIndex, setSelectedCommitIndex] = useState<number>(0);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [chosenFilePath, setChosenFilePath] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [fileTreeMode, setFileTreeMode] = useState<"full"|"changes">("full");
  const [loadingFileTree, setLoadingFileTree] = useState<boolean>(false)

  // Job for commits
  const { 
    start: fetchCommits, 
    status: commitsStatus, 
    result: commits, 
    updateResult: setCommits,
    error: commitsError 
  } = useJobPolling<Commit[]>({
    startJobFn: (params) => gitApi.startCommitsJob(params.url, params.branch, params.fileTreeMode),
    pollJobFn: gitApi.pollCommitsJob
  });

  // Job for repository metadata
  const { 
    start: fetchRepositoryMetadata, 
    status: repositoryMetadataStatus, 
    result: repositoryMetadata, 
    error: repositoryMetadataError 
  } = useJobPolling<any[]>({
    startJobFn: (url) => gitApi.startRepositoryMetadataJob(url),
    pollJobFn: gitApi.pollRepositoryMetadataJob
  });

  // Job for forks
  const { 
    start: fetchForks, 
    status: forksStatus, 
    result: forks, 
    error: forksError 
  } = useJobPolling<Repository[]>({
    startJobFn: (params) => gitApi.startForksJob(params.url, params.maxForksAmount),
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

  // Effect: Download file when commit is changed or new file is selected
  useEffect(() => {
    if (chosenFilePath && commits && commits[selectedCommitIndex]) {
      fetchFile({
        url: repoUrl,
        hash: commits[selectedCommitIndex].hash,
        path: chosenFilePath
      });
    }
  }, [chosenFilePath, selectedCommitIndex, commits]); 

  // Effect: Download file tree when commit loaded or another commit selected or fileTreeMode is changed
  useEffect(() => {
    if (commits && commits[selectedCommitIndex] && commitsStatus==="completed") {
      const selectedCommit = commits[selectedCommitIndex];
    
      const getCommitWithFiles = async (): Promise<void> => {
        // Not getting files for commit if they already downloaded or fileTreeMode was not changed
        if (selectedCommit.files.length === 0 || selectedCommit.fileTreeMode!==fileTreeMode) {
          setLoadingFileTree(true);
          const commitWithFiles = await gitApi.getCommitWithFiles(commits[selectedCommitIndex], repoUrl, selectedBranch, fileTreeMode)

          // Downloading files to one commit from whole list
          const newCommits = [...commits]; 
          newCommits[selectedCommitIndex] = commitWithFiles; 
          setCommits(newCommits); 
          setLoadingFileTree(false);
        }
      }
      getCommitWithFiles()
    }
  }, [selectedCommitIndex, fileTreeMode, commitsStatus])

  // Effect: Setting selectedCommitIndex to 0, when another repo selected to avoid situations
  // where the selected selectedCommitIndex of the previous repository is greater than the total number of commits of the new repository.
  const firstCommitHashRef = useRef<string | null>(null);
  useEffect(() => {
    if (commits && commits.length > 0 && commitsStatus === "completed") {
      const firstHash = commits[0].hash;

      // If the hash of the first commit in the new array is different from what we saw before
      if (firstCommitHashRef.current !== firstHash) {
        setSelectedCommitIndex(0);
        firstCommitHashRef.current = firstHash;
      }
    }
  }, [commits, commitsStatus]);

  return (
    <div className="flex min-h-screen font-sans bg-[#0b1117] text-[#c9d1d9]">
      {/* Custom scrollbar styling for the main window */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0b1117;
        }
        ::-webkit-scrollbar-thumb {
          background: #30363d;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #484f58;
        }
        html {
          scrollbar-width: thin;
          scrollbar-color: #30363d #0b1117;
        }
      `}</style>

      <div className="flex w-full">
        {/* Container for Sidebar to handle full height sticky positioning */}
        <div className="flex-shrink-0 sticky top-0 h-screen">
          {commitsStatus === "processing" && <div className="p-4">Analyzing repository...</div>}
          {commitsStatus === "failed" && <div className="p-4 text-red-500">Error: {commitsError}</div>}
          {(commits && commits[selectedCommitIndex]?.files) &&
            <FileTree
              fileTreeItems={buildFileTree(commits[selectedCommitIndex].files)}
              choosedFile={chosenFilePath}
              loadingFileTree={loadingFileTree}
              onSelect={(path) => setChosenFilePath(path)}
            />
          }
        </div>

        <main className="flex-1 p-6 w-px">
          <RepoUrlInput 
            commitsStatus={commitsStatus}
            repoUrl={repoUrl}
            fileTreeMode={fileTreeMode}
            setFileTreeMode={setFileTreeMode}
            setRepoUrl={setRepoUrl}
            setChosenFilePath={setChosenFilePath}
            fetchCommits={fetchCommits}
            fetchRepositoryMetadata={fetchRepositoryMetadata}
            fetchForks={fetchForks}
          />

          {commits && repositoryMetadataStatus === "completed" && 
            <RepoAndCommitInfo 
              commit={commits[selectedCommitIndex]}
              repoUrl={repoUrl}
              repositoryMetadata={repositoryMetadata}
              selectedBranch={selectedBranch}
              forks={forks}
              fetchCommits={fetchCommits}
              fetchRepositoryMetadata={fetchRepositoryMetadata}
              fetchForks={fetchForks}
              setSelectedBranch={setSelectedBranch}
              setRepoUrl={setRepoUrl}
            />
          }

          <FileViewer 
            fileStatus={fileStatus}
            fileError={fileError}
            fileContent={fileContent}
            fileTree={(commits && commits[selectedCommitIndex]?.files) ? buildFileTree(commits[selectedCommitIndex].files) : []}
            chosenFilePath={chosenFilePath}
            setChosenFilePath={setChosenFilePath}
          />

          {commits && commits[selectedCommitIndex] && commits[selectedCommitIndex]?.files &&
            <CommitSelection
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