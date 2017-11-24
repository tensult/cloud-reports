import { BaseAnalyzer } from '../../../base'
import { ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisResult } from '../../../../types';

export class DefaultVpcUsedRDSInstancesAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allVpcs = fullReport['aws.vpc'].vpcs;
        const allInstances = params.instances;
        if (!allVpcs || !allInstances) {
            return undefined;
        }
        const default_vpcs_used: CheckAnalysisResult = {};
        default_vpcs_used.what = "Are there any default vpc used for RDS instances?";
        default_vpcs_used.why = "Default vpcs are open to world by default and requires extra setup make them secure"
        default_vpcs_used.recommendation = "Recommended not to use default vpc instead create a custom one as they make you better understand the security posture";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allInstances) {
            let regionInstances = allInstances[region];
            let regionVpcs = allVpcs[region];
            let defaultVpcs = this.getDefaultVpcs(regionVpcs);
            allRegionsAnalysis[region] = [];
            for (let instance of regionInstances) {
                let instanceAnalysis: ResourceAnalysisResult = {};
                instanceAnalysis.resource = { instanceName: instance.DBInstanceIdentifier, vpcId: instance.DBSubnetGroup.VpcId } ;
                instanceAnalysis.resourceSummary = {
                    name: 'Instance',
                    value: instance.DBInstanceIdentifier
                }
                if (this.isVpcExist(defaultVpcs, instance.DBSubnetGroup.VpcId)) {
                    instanceAnalysis.severity = SeverityStatus.Failure;
                    instanceAnalysis.message = 'Default VPC is used';
                    instanceAnalysis.action = 'Use custom VPC instead default VPC';
                } else {
                    instanceAnalysis.severity = SeverityStatus.Good;
                    instanceAnalysis.message = 'Default VPC is not used';
                }
                allRegionsAnalysis[region].push(instanceAnalysis);
            }
        }
        default_vpcs_used.regions = allRegionsAnalysis;
        return { default_vpcs_used };
    }

    private getDefaultVpcs(vpcs: any[]) {
        return vpcs.filter((vpc) => {
            return vpc.IsDefault;
        });
    }

    private isVpcExist(vpcs, vpcId) {
        return vpcs.filter((vpc) => {
            return vpc.VpcId === vpcId;
        }).length > 0;
    }
}