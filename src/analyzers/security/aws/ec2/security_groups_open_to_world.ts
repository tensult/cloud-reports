import { BaseAnalyzer } from '../../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus } from '../../../../types';

export class SecurityGroupsOpenToWorldAnalyzer extends BaseAnalyzer {
    // TODO: HTTP, HTTPS should be ok if it is a website
    analyze(params: any, fullReport?: any): any {
        const allSecurityGroups = params.security_groups;
        if (!allSecurityGroups) {
            return undefined;
        }
        const security_groups_open_to_world: CheckAnalysisResult = {};
        security_groups_open_to_world.what = "Are there any security groups open to world?";
        security_groups_open_to_world.why = "Security group open to world posses serious security threat so we need to allow only intended parties to access";
        security_groups_open_to_world.recommendation = "Recommended to configure security groups as tight as needed";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allSecurityGroups) {
            let regionSecurityGroups = allSecurityGroups[region];
            allRegionsAnalysis[region] = [];
            for (let securityGroup of regionSecurityGroups) {
                if(securityGroup.GroupName == 'default') {
                    continue;
                }
                let securityGroupAnalysis: ResourceAnalysisResult = {};
                securityGroupAnalysis.resource = securityGroup;
                securityGroupAnalysis.resourceSummary = {
                    name: 'SecurityGroup',
                    value: `${securityGroup.GroupName} | ${securityGroup.GroupId}`
                }
                if (this.isOpenToWorld(securityGroup)) {
                    securityGroupAnalysis.severity = SeverityStatus.Failure;
                    securityGroupAnalysis.message = 'Security group is open to entire world';
                    securityGroupAnalysis.action = 'Remove rule containing IP range: 0.0.0.0/0.'
                } else {
                    securityGroupAnalysis.severity = SeverityStatus.Good;
                    securityGroupAnalysis.message = 'Security group is restricted to few IP ranges';
                }
                allRegionsAnalysis[region].push(securityGroupAnalysis);
            }
        }
        security_groups_open_to_world.regions = allRegionsAnalysis;
        return { security_groups_open_to_world };
    }

    private isOpenToWorld(securityGroup: any) {
        const openIpRanges = securityGroup.IpPermissions.filter((rule) => {
            return rule.IpRanges.findIndex((ipRange) => {
                return ipRange.CidrIp === '0.0.0.0/0';
            }) !== -1;
        });
        return openIpRanges.length > 0;
    }
}