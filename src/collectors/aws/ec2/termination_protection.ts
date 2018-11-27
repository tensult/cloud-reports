import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { EC2InstancesCollector } from "./instances";
import { CollectorUtil } from "../../../utils";
import { AWSErrorHandler } from '../../../utils/aws';

export class TerminationProtectionCollector extends BaseCollector {
    collect() {
        return this.getTerminationProtectionStatus();
    }

    private async getTerminationProtectionStatus() {

        const serviceName = 'EC2';
        const ec2Regions = this.getRegions(serviceName);
        const termination_protection = {};
        const ec2InstancesCollector = new EC2InstancesCollector();
        ec2InstancesCollector.setSession(this.getSession());
        try {
            const instancesData = await CollectorUtil.cachedCollect(ec2InstancesCollector);
            const instances = instancesData.instances;
            for (let region of ec2Regions) {
                try {
                    let ec2 = this.getClient(serviceName, region) as AWS.EC2;
                    termination_protection[region] = {};
                    for (let instance of instances[region]) {
                        const instanceAttributeResponse: AWS.EC2.InstanceAttribute = await ec2.describeInstanceAttribute({ Attribute: 'disableApiTermination', InstanceId: instance.InstanceId }).promise();
                        termination_protection[region][instance.InstanceId] = instanceAttributeResponse.DisableApiTermination;
                    }
                } catch (error) {
                    AWSErrorHandler.handle(error);
                    continue;
                }
            }
        } catch (error) {
            AWSErrorHandler.handle(error);
        }
        return { termination_protection };
    }
}