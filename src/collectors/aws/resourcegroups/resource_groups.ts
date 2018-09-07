import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { LogUtil } from '../../../utils/log';

export class ResourceGroupsCollector extends BaseCollector {
    collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllResourceGroups();
    }

    private async getAllResourceGroups() {

        const self = this;

        const serviceName = 'ResourceGroups';
        const resourceGroupsRegions = self.getRegions(serviceName);
        const resource_groups = {};

        for (let region of resourceGroupsRegions) {
            try {
                let resourceGroups = self.getClient(serviceName, region) as AWS.ResourceGroups;
                resource_groups[region] = [];
                let fetchPending = true;
                let marker: string | undefined = undefined;
                while (fetchPending) {
                    const resourceGroupsResponse: AWS.ResourceGroups.Types.ListGroupsOutput = await resourceGroups.listGroups({ NextToken: marker }).promise();
                    if(resourceGroupsResponse.Groups) {
                        resource_groups[region] = resource_groups[region].concat(resourceGroupsResponse.Groups);
                    }
                    marker = resourceGroupsResponse.NextToken;
                    fetchPending = marker !== undefined && marker !== null;
                }
            } catch (error) {
                LogUtil.error(error);
            }
        }
        return { resource_groups };
    }
}