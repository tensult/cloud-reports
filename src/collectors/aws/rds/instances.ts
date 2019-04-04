import * as AWS from "aws-sdk";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { CommonUtil } from "../../../utils";

export class RDSInstancesCollector extends BaseCollector {
    public collect() {
        return this.getAllInstances();
    }

    private async getAllInstances() {

        const self = this;

        const serviceName = "RDS";
        const rdsRegions = self.getRegions(serviceName);
        const instances = {};

        for (const region of rdsRegions) {
            try {
                const rds = self.getClient(serviceName, region) as AWS.RDS;
                instances[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const instancesResponse: AWS.RDS.DBInstanceMessage =
                        await rds.describeDBInstances({ Marker: marker }).promise();
                    instances[region] = instances[region].concat(instancesResponse.DBInstances);
                    marker = instancesResponse.Marker;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { instances };
    }
}
