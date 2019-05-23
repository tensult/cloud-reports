import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class DefaultVpcUsedRDSInstancesAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        if (!fullReport["aws.vpc"] || !fullReport["aws.vpc"].vpcs || !allInstances) {
            return undefined;
        }
        const allVpcs = fullReport["aws.vpc"].vpcs;
        const default_vpcs_used: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        default_vpcs_used.what = "Are there any default vpc used for RDS instances?";
        default_vpcs_used.why = "Default vpcs are open to world by default and requires extra setup make them secure";
        default_vpcs_used.recommendation = `Recommended not to use default vpc instead create a
        custom one as they make you better understand the security posture`;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allInstances) {
            const regionInstances = allInstances[region];
            const regionVpcs = allVpcs[region];
            const defaultVpcs = this.getDefaultVpcs(regionVpcs);
            allRegionsAnalysis[region] = [];
            for (const instance of regionInstances) {
                const instanceAnalysis: IResourceAnalysisResult = {};
                if (!instance.DBSubnetGroup) {
                    continue;
                }
                instanceAnalysis.resource = {
                    instanceName: instance.DBInstanceIdentifier,
                    vpcId: instance.DBSubnetGroup.VpcId,
                };
                instanceAnalysis.resourceSummary = {
                    name: "DBInstance",
                    value: instance.DBInstanceIdentifier,
                };
                if (this.isVpcExist(defaultVpcs, instance.DBSubnetGroup.VpcId)) {
                    instanceAnalysis.severity = SeverityStatus.Failure;
                    instanceAnalysis.message = "Default VPC is used";
                    instanceAnalysis.action = "Use custom VPC instead of default VPC";
                } else {
                    instanceAnalysis.severity = SeverityStatus.Good;
                    instanceAnalysis.message = "Default VPC is not used";
                }
                allRegionsAnalysis[region].push(instanceAnalysis);
            }
        }
        default_vpcs_used.regions = allRegionsAnalysis;
        return { default_vpcs_used };
    }

    private getDefaultVpcs(vpcs: any[]) {
        if (!vpcs) {
            return [];
        }
        return vpcs.filter((vpc) => {
            return vpc.IsDefault;
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
