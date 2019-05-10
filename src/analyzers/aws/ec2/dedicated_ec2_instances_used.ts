import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class DedicatedTenUsedEC2InstancesAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        if (!fullReport["aws.ec2"] || !fullReport["aws.ec2"].ec2 || !allInstances) {
            return undefined;
        }
        const allEc2s = fullReport["aws.ec2"].ec2;

        const dedicated_ec2_used: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        dedicated_ec2_used.what = "Are there any dedicated ec2 used for EC2 instances?";
        dedicated_ec2_used.why = "Dedicated ec2 are open to world by dedicated and requires extra setup make them secure";
        dedicated_ec2_used.recommendation = `Recommended not to use dedicated ec2 instead create a custom one
        as they make you better understand the security posture`;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allInstances) {
            const regionInstances = allInstances[region];
            const regionEc2s = allEc2s[region];
            const dedicatedEc2s = this.getDedicatedEc2s(regionEc2s);
            allRegionsAnalysis[region] = [];
            for (const instance of regionInstances) {
                const instanceAnalysis: IResourceAnalysisResult = {};
                instanceAnalysis.resource = {
                    instanceId: instance.InstanceId,
                    instanceName: ResourceUtil.getNameByTags(instance),
                    ec2Id: instance.Ec2Id,
                };
                instanceAnalysis.resourceSummary = {
                    name: "Instance",
                    value: `${instanceAnalysis.resource.instanceName} | ${instance.InstanceId}`,
                };
                if (this.isEc2Exist(dedicatedEc2s, instance.Ec2Id)) {
                    instanceAnalysis.severity = SeverityStatus.Failure;
                    instanceAnalysis.message = "Dedicated Ec2 is used";
                    instanceAnalysis.action = "Use custom Ec2 instead of dedicated Ec2";
                } else {
                    instanceAnalysis.severity = SeverityStatus.Good;
                    instanceAnalysis.message = "Dedicated Ec2 is not used";
                }
                allRegionsAnalysis[region].push(instanceAnalysis);
            }
        }
        dedicated_ec2_used.regions = allRegionsAnalysis;
        return { dedicated_ec2_used };
    }

    private getDedicatedEc2s(ec2: any[]) {
        if (!ec2) {
            return [];
        }
        return ec2.filter((ec2) => {
            return ec2.IsDedicated;
        });
    }

    private isEc2Exist(ec2, ec2Id) {
        if (!ec2 || !ec2Id) {
            return false;
        }
        return ec2.filter((ec2) => {
            return ec2.Ec2Id === ec2Id;
        }).length > 0;
    }
}
