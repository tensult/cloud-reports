import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class DefaultSecurityGroupsUsedAnalyzer extends BaseAnalyzer {
    public  checks_what : string = "Are there any default security groups used for EC2 instances?";
    public  checks_why : string = `Default security groups are open to world by
    default and requires extra setup make them secure`;
    public checks_recommendation: string = `Recommended not to use default security groups instead
        create a custom one as they make you better understand the security posture`;
    public checks_name : string = "Instance";
    public analyze(params: any, fullReport?: any): any {
        const allSecurityGroups = params.security_groups;
        const allInstances = params.instances;
        if (!allSecurityGroups || !allInstances) {
            return undefined;
        }
        const default_security_groups_used: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        default_security_groups_used.what = this.checks_what;
        default_security_groups_used.why = this.checks_why;
        default_security_groups_used.recommendation = this.checks_recommendation;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allInstances) {
            const regionInstances = allInstances[region];
            const regionSecurityGroups = allSecurityGroups[region];
            const defaultSecurityGroups = this.getDefaultSecurityGroups(regionSecurityGroups);
            allRegionsAnalysis[region] = [];
            for (const instance of regionInstances) {
                const instanceAnalysis: IResourceAnalysisResult = {};
                instanceAnalysis.resource = {
                    instanceId: instance.InstanceId,
                    instanceName: ResourceUtil.getNameByTags(instance),
                    security_groups: instance.SecurityGroups,
                };
                instanceAnalysis.resourceSummary = {
                    name: this.checks_name,
                    value: `${instanceAnalysis.resource.instanceName} | ${instance.InstanceId}`,
                };
                if (this.isCommonSecurityGroupExist(defaultSecurityGroups, instance.SecurityGroups)) {
                    instanceAnalysis.severity = SeverityStatus.Failure;
                    instanceAnalysis.message = "Default security groups are used";
                    instanceAnalysis.action = "Use custom security group instead default security group";
                } else {
                    instanceAnalysis.severity = SeverityStatus.Good;
                    instanceAnalysis.message = "Default security groups are not used";
                }
                allRegionsAnalysis[region].push(instanceAnalysis);
            }
        }
        default_security_groups_used.regions = allRegionsAnalysis;
        return { default_security_groups_used };
    }

    private getDefaultSecurityGroups(securityGroups: any[]) {
        if (!securityGroups) {
            return [];
        }
        return securityGroups.filter((securityGroup) => {
            return securityGroup.GroupName === "default";
        });
    }

    private isCommonSecurityGroupExist(securityGroups1, securityGroups2) {
        if (!securityGroups1 || !securityGroups2) {
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
