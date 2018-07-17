import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';
import { ResourceUtil } from '../../../utils';

export class DefaultSecurityGroupsUsedAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allSecurityGroups = params.security_groups;
        const allInstances = params.instances;
        if (!allSecurityGroups || !allInstances) {
            return undefined;
        }
        const default_security_groups_used: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        default_security_groups_used.what = "Are there any default security groups used for EC2 instances?";
        default_security_groups_used.why = "Default security groups are open to world by default and requires extra setup make them secure"
        default_security_groups_used.recommendation = "Recommended not to use default security groups instead create a custom one as they make you better understand the security posture";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allInstances) {
            let regionInstances = allInstances[region];
            let regionSecurityGroups = allSecurityGroups[region];
            let defaultSecurityGroups = this.getDefaultSecurityGroups(regionSecurityGroups);
            allRegionsAnalysis[region] = [];
            for (let instance of regionInstances) {
                let instanceAnalysis: ResourceAnalysisResult = {};
                instanceAnalysis.resource = { instanceName: ResourceUtil.getNameByTags(instance), instanceId: instance.InstanceId, security_groups: instance.SecurityGroups } ;
                instanceAnalysis.resourceSummary = {
                    name: 'Instance',
                    value: `${instanceAnalysis.resource.instanceName} | ${instance.InstanceId}`
                }
                if (this.isCommonSecurityGroupExist(defaultSecurityGroups, instance.SecurityGroups)) {
                    instanceAnalysis.severity = SeverityStatus.Failure;
                    instanceAnalysis.message = 'Default security groups are used';
                    instanceAnalysis.action = 'Use custom security group instead default security group';
                } else {
                    instanceAnalysis.severity = SeverityStatus.Good;
                    instanceAnalysis.message = 'Default security groups are not used';
                }
                allRegionsAnalysis[region].push(instanceAnalysis);
            }
        }
        default_security_groups_used.regions = allRegionsAnalysis;
        return { default_security_groups_used };
    }

    private getDefaultSecurityGroups(securityGroups: any[]) {
        if(!securityGroups) {
            return [];
        }
        return securityGroups.filter((securityGroup) => {
            return securityGroup.GroupName === 'default';
        });
    }

    private isCommonSecurityGroupExist(securityGroups1, securityGroups2) {
        if(!securityGroups1 || !securityGroups2) {
            return false;
        }
        const commonSecurityGroups = securityGroups1.filter((securityGroup1) => {
            return securityGroups2.filter((securityGroup2) => {
                return securityGroup1.GroupId === securityGroup2.GroupId;
            }).length > 0;
        });
        return commonSecurityGroups.length > 0;
    }
}