import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class SSHPortOpenToWorldAnalyzer extends BaseAnalyzer {
    analyze(params: any, fullReport?: any): any {
        const allSecurityGroups = params.security_groups;
        if (!allSecurityGroups) {
            return undefined;
        }
        const ssh_port_open_to_world: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        ssh_port_open_to_world.what = "Is SSH port open to world?";
        ssh_port_open_to_world.why = "We should always restrict SSH port only intended parties to access";
        ssh_port_open_to_world.recommendation = "Recommended to restrict SSH port in security groups to specific IPs";
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
                if (this.isSSHOpenToWorld(securityGroup)) {
                    securityGroupAnalysis.severity = SeverityStatus.Failure;
                    securityGroupAnalysis.message = 'SSH Port is open to entire world';
                    securityGroupAnalysis.action = 'Restrict SSH port'
                } else {
                    securityGroupAnalysis.severity = SeverityStatus.Good;
                    securityGroupAnalysis.message = 'SSH port is not open to entire world';
                }
                allRegionsAnalysis[region].push(securityGroupAnalysis);
            }
        }
        ssh_port_open_to_world.regions = allRegionsAnalysis;
        return { ssh_port_open_to_world };
    }

    private isSSHOpenToWorld(securityGroup: any) {
        if(!securityGroup) {
            return false;
        }

        return securityGroup.IpPermissions.some((rule) => {
            return rule.FromPort === 22 && rule.IpRanges.some((ipRange) => {
                return ipRange.CidrIp === '0.0.0.0/0';
            });
        });
    }
}