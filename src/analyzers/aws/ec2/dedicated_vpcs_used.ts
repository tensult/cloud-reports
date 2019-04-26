import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class DedicatedVpcUsedEC2InstancesAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        if (!fullReport["aws.vpc"] || !fullReport["aws.vpc"].vpcs || !allInstances) {
            return undefined;
        }
        const allVpcs = fullReport["aws.vpc"].vpcs;

        const dedicated_vpcs_used: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        dedicated_vpcs_used.what = "Are there any dedicated vpc used for EC2 instances?";
        dedicated_vpcs_used.why = "dedicated vpcs are not open to world by dedicated and are secure";
        dedicated_vpcs_used.recommendation = `Recommended to use dedicated vpc or create a custom one
        as they make you better understand the security posture`;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allInstances) {
            const regionInstances = allInstances[region];
            const regionVpcs = allVpcs[region];
            const dedicatedVpcs = this.getdedicatedVpcs(regionVpcs);
            allRegionsAnalysis[region] = [];
            for (const instance of regionInstances) {
                const instanceAnalysis: IResourceAnalysisResult = {};
                instanceAnalysis.resource = {
                    instanceId: instance.InstanceId,
                    instanceName: ResourceUtil.getNameByTags(instance),
                    vpcId: instance.VpcId,
                };
                instanceAnalysis.resourceSummary = {
                    name: "Instance",
                    value: `${instanceAnalysis.resource.instanceName} | ${instance.InstanceId}`,
                };
                if (this.isVpcExist(dedicatedVpcs, instance.VpcId)) {
                    instanceAnalysis.severity = SeverityStatus.Failure;
                    instanceAnalysis.message = "dedicated VPC is not used";
                    instanceAnalysis.action = "Use custom VPC or dedicated VPC";
                } else {
                    instanceAnalysis.severity = SeverityStatus.Good;
                    instanceAnalysis.message = "dedicated VPC is used";
                }
                allRegionsAnalysis[region].push(instanceAnalysis);
            }
        }
        dedicated_vpcs_used.regions = allRegionsAnalysis;
        return { dedicated_vpcs_used };
    }

    private getdedicatedVpcs(vpcs: any[]) {
        if (!vpcs) {
            return [];
        }
        return vpcs.filter((vpc) => {
            return vpc.Isdedicated;
        });
    }

    private isVpcExist(vpcs, vpcId) {
        if (!vpcs || !vpcId) {
            return false;
        }
        return vpcs.filter((vpc) => {
            return vpc.VpcId === vpcId;
        }).length > 0;
    }
}
