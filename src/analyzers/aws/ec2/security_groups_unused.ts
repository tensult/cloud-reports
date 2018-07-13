import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';
import { ResourceUtil } from '../../../utils';

export class SecurityGroupsUnusedAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allSecurityGroups = params.security_groups;
        const allInstances = params.instances;
        if (!allSecurityGroups || !allInstances) {
            return undefined;
        }
        const security_groups_unused: CheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        security_groups_unused.what = "Are there any security groups unused?";
        security_groups_unused.why = "Unused security groups causes confusion and allows to make mistakes"
        security_groups_unused.recommendation = "Recommended delete unused security groups";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allInstances) {
            let regionInstances = allInstances[region];
            let regionSecurityGroups = allSecurityGroups[region];
            allRegionsAnalysis[region] = [];
            let securityGroupInstancesMap: Dictionary<any[]> = {};
            if(!regionInstances) {
                continue;
            }
            for (let instance of regionInstances) {
                let instanceData = { name: ResourceUtil.getNameByTags(instance), instanceId: instance.InstanceId }
                for(let securityGroup of instance.SecurityGroups) {
                    securityGroupInstancesMap[securityGroup.GroupId] = securityGroupInstancesMap[securityGroup.GroupId] || [];
                    securityGroupInstancesMap[securityGroup.GroupId].push(instanceData);
                }
            }
            if(!regionSecurityGroups) {
                continue;
            }
            for (let securityGroup of regionSecurityGroups) {
                if(securityGroup.GroupName === 'default') {
                    continue;
                }
                let securityGroupAnalysis: ResourceAnalysisResult = {};
                securityGroupAnalysis.resource = {name: securityGroup.GroupName, id: securityGroup.GroupId, instances: securityGroupInstancesMap[securityGroup.GroupId]};
                securityGroupAnalysis.resourceSummary = {
                    name: 'SecurityGroup',
                    value: `${securityGroup.GroupName} | ${securityGroup.GroupId}`
                }
                if (securityGroupInstancesMap[securityGroup.GroupId]) {
                    securityGroupAnalysis.severity = SeverityStatus.Good;
                    securityGroupAnalysis.message = 'Security group is used';
                } else {
                    securityGroupAnalysis.severity = SeverityStatus.Warning;
                    securityGroupAnalysis.message = 'Security group is not used';
                    securityGroupAnalysis.action = 'Delete the security group';
                }
                allRegionsAnalysis[region].push(securityGroupAnalysis);
            }
        }
        security_groups_unused.regions = allRegionsAnalysis;
        return { security_groups_unused };
    }
}