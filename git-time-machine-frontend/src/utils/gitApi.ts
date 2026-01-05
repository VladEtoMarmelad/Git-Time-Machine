import axios from "axios";

const API_URL = "http://localhost:3030";

export const gitApi = {
  startCommitsJob: async (repoUrl: string, branch: string = "", fileTreeMode: "full"|"changes") => {
    const res = await axios.post(`${API_URL}/git/getCommits`, { repoUrl, branch, fileTreeMode });
    return res.data.jobId;
  },
  pollCommitsJob: async (id: string) => {
    const res = await axios.get(`${API_URL}/git/getCommits/${id}`);
    return { 
      state: res.data.state, 
      result: res.data.result?.commits, // Commit[]
      failedReason: res.data.failedReason 
    };
  },

  startRepositoryMetadataJob: async (repoUrl: string) => {
    const res = await axios.post(`${API_URL}/git/repositoryMetadata`, { repoUrl });
    return res.data.jobId;
  },
  pollRepositoryMetadataJob: async (id: string) => {
    const res = await axios.get(`${API_URL}/git/repositoryMetadata/${id}`);
    return { 
      state: res.data.state, 
      result: res.data.result,
      failedReason: res.data.failedReason 
    };
  },

  startFileJob: async (repoUrl: string, commitHash: string, filePath: string) => {
    const res = await axios.post(`${API_URL}/git/file`, { repoUrl, commitHash, filePath });
    return res.data.jobId;
  },
  pollFileJob: async (id: string) => {
    const res = await axios.get(`${API_URL}/git/file/${id}`);
    return {
      state: res.data.state,
      result: res.data.result, // File
      failedReason: res.data.failedReason
    };
  },

  startForksJob: async (repoUrl: string, maxForksAmount: number) => {
    const res = await axios.post(`${API_URL}/git/forks`, { repoUrl, maxForksAmount });
    return res.data.jobId;
  },
  pollForksJob: async (id: string) => {
    const res = await axios.get(`${API_URL}/git/forks/${id}`);
    return { 
      state: res.data.state, 
      result: res.data.result, // string[]
      failedReason: res.data.failedReason 
    };
  },
};