import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
// import {CodeCommitRepositoryListCollector} from "./repository_list";

export class CodeCommitRepositoryCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllRepositories();
    }

    private getRepository(codecommitObj: AWS.CodeCommit, repositoryName: string) {
        return codecommitObj.getRepository({ repositoryName }).promise();
    }

    private async getAllRepositories() {
        const self = this;
        const serviceName = "CodeCommit";
        const codecommitRegions = self.getRegions(serviceName);
        const repository_list = {};
        for (const region of codecommitRegions) {
            try {
                const CodeCommit = self.getClient(serviceName, region) as AWS.CodeCommit;
                repository_list[region] = [];
                let fetchPending = true;
                let token: string | undefined;
                while (fetchPending) {
                    const repositoryListResponse: any = await CodeCommit.listRepositories({ nextToken: token }).promise();
                    for (let repository of repositoryListResponse.repositories) {
                        const repoInfo = await self.getRepository(CodeCommit, repository.repositoryName);
                        repository = Object.assign(repository, repoInfo.repositoryMetadata);
                    }
                    repository_list[region] = repository_list[region].concat(repositoryListResponse.repositories);
                    await CommonUtil.wait(200);
                    token = repositoryListResponse.nextToken;
                    fetchPending = token !== undefined;
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { repository_list };
    }

}