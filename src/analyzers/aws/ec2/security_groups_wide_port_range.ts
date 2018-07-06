import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class SecurityGroupsWidePortRangeAnalyzer extends BaseAnalyzer {
    analyze(params: any, fullReport?: any): any {
        const allSecurityGroups = params.security_groups;
        if (!allSecurityGroups) {
            return undefined;
        }
        const security_groups_wide_port_range: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        security_groups_wide_port_range.what = "Are there any security groups with wide range of ports?";
        security_groups_wide_port_range.why = "Security group should not expose wide range of port as it will be valnerable for port scan attacks";
        security_groups_wide_port_range.recommendation = "Recommended to expose only port used by application";
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
                if (this.containsWidePortRange(securityGroup)) {
                    securityGroupAnalysis.severity = SeverityStatus.Failure;
                    securityGroupAnalysis.message = 'Exposes wide port range';
                    securityGroupAnalysis.action = 'Remove rule containing IP protocol: -1'
                } else {
                    securityGroupAnalysis.severity = SeverityStatus.Good;
                    securityGroupAnalysis.message = 'Exposes only specific ports';
                }
                allRegionsAnalysis[region].push(securityGroupAnalysis);
            }
        }
        security_groups_wide_port_range.regions = allRegionsAnalysis;
        return { security_groups_wide_port_range };
    }

    private containsWidePortRange(securityGroup: any) {
        const widePortRanges = securityGroup.IpPermissions.filter((rule) => {
            return rule.IpProtocol === "-1";
        });
        return widePortRanges.length > 0;
    }
}