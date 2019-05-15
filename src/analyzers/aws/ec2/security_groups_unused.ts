import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class SecurityGroupsUnusedAnalyzer extends BaseAnalyzer {
    public  checks_what : string = "Are there any security groups unused?";
    public  checks_why : string = "Unused security groups causes confusion and allows to make mistakes";
    public  checks_recommendation : string = "Recommended delete unused security groups";
    public  checks_name : string = "SecurityGroup";
    public analyze(params: any, fullReport?: any): any {
        const allSecurityGroups = params.security_groups;
        const allInstances = params.instances;
        if (!allSecurityGroups || !allInstances) {
            return undefined;
        }
        const security_groups_unused: ICheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        security_groups_unused.what = this.checks_what;
        security_groups_unused.why = this.checks_why;
        security_groups_unused.recommendation = this.checks_recommendation;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allInstances) {
            const regionInstances = allInstances[region];
            const regionSecurityGroups = allSecurityGroups[region];
            allRegionsAnalysis[region] = [];
            const securityGroupInstancesMap: IDictionary<any[]> = {};
            if (!regionInstances) {
                continue;
            }
            for (const instance of regionInstances) {
                const instanceData = { name: ResourceUtil.getNameByTags(instance), instanceId: instance.InstanceId };
                for (const securityGroup of instance.SecurityGroups) {
                    securityGroupInstancesMap[securityGroup.GroupId] =
                        securityGroupInstancesMap[securityGroup.GroupId] || [];
                    securityGroupInstancesMap[securityGroup.GroupId].push(instanceData);
                }
            }
            if (!regionSecurityGroups) {
                continue;
            }
            for (const securityGroup of regionSecurityGroups) {
                if (securityGroup.GroupName === "default") {
                    continue;
                }
                const securityGroupAnalysis: IResourceAnalysisResult = {};
                securityGroupAnalysis.resource = {
                    id: securityGroup.GroupId,
                    instances: securityGroupInstancesMap[securityGroup.GroupId],
                    name: securityGroup.GroupName,

                };
                securityGroupAnalysis.resourceSummary = {
                    name: this.checks_name,
                    value: `${securityGroup.GroupName} | ${securityGroup.GroupId}`,
                };
                if (securityGroupInstancesMap[securityGroup.GroupId]) {
                    securityGroupAnalysis.severity = SeverityStatus.Good;
                    securityGroupAnalysis.message = "Security group is used";
                } else {
                    securityGroupAnalysis.severity = SeverityStatus.Warning;
                    securityGroupAnalysis.message = "Security group is not used";
                    securityGroupAnalysis.action = "Delete the security group";
                }
                allRegionsAnalysis[region].push(securityGroupAnalysis);
            }
        }
        security_groups_unused.regions = allRegionsAnalysis;
        return { security_groups_unused };
    }
}
