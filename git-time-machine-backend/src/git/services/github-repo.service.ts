import { Injectable } from "@nestjs/common";
import { GithubClientService } from "./github-client.service";
import { Repository } from "@sharedTypes/Repository";

@Injectable()
export class GithubRepoService {
  constructor(private readonly client: GithubClientService) {}

  async getGitObjects (repoUrl: string, type: "forks" | "branches", maxGitObjectsAmount: number): Promise<Repository[] | string[]> {
    // URL Parsing
    const urlParts = repoUrl.replace("https://github.com/", "").split("/");
    const owner = urlParts[0];
    const repo = urlParts[1]?.replace(".git", "");

    if (!owner || !repo) {
      throw new Error("Invalid repository URL");
    }

    const allGitObjects: any = [];
    
    try {
      // Use a pagination iterator for efficient data retrieval
      // It automatically requests subsequent pages until we break the loop
      const iterator = type === "forks" 
        ? this.client.octokit.paginate.iterator(this.client.octokit.rest.repos.listForks, {
            owner,
            repo,
            per_page: 100,
            sort: "newest",
          })
        : this.client.octokit.paginate.iterator(this.client.octokit.rest.repos.listBranches, {
            owner,
            repo,
            per_page: 100,
          });

      for await (const { data: items } of iterator) {
        for (const item of items) {
          if (allGitObjects.length >= maxGitObjectsAmount) break;

          // Data mapping
          if (type === "forks") {
            allGitObjects.push({
              name: (item as any).full_name,
              url: (item as any).html_url,
            });
          } else {
            allGitObjects.push((item as any).name);
          }
        }

        // If the required amount is reached, exit the pagination loop
        if (allGitObjects.length >= maxGitObjectsAmount) break;
      }

      return allGitObjects;
    } catch (error: any) {
      console.error(`Error fetching ${type}:`, error.message);
      throw error;
    }
  };

  async getMetadata(repoUrl: string) {
    const urlParts = repoUrl.replace("https://github.com/", "").split("/");
    const owner = urlParts[0];
    const repo = urlParts[1]?.replace(".git", "");
    const { data } = await this.client.octokit.repos.get({ owner, repo });
    return { 
      branches: await this.getGitObjects(repoUrl, "branches", 100),
      stars: data.stargazers_count, 
      description: data.description 
    };
  }

  async getForks(repoUrl: string, maxForksAmount = 100) {
    return this.getGitObjects(repoUrl, "forks", maxForksAmount)
  }
}