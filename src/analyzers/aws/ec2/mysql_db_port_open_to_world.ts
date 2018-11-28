import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class MySQLPortOpenToWorldAnalyzer extends BaseAnalyzer {
    public analyze(params: any, fullReport?: any): any {
        const allSecurityGroups = params.security_groups;
        if (!allSecurityGroups) {
            return undefined;
        }
        const mysql_db_port_open_to_world: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        mysql_db_port_open_to_world.what = "Is MySQL port open to world?";
        mysql_db_port_open_to_world.why = "We should always restrict MySQL port only intended parties to access";
        mysql_db_port_open_to_world.recommendation = `Recommended to restrict MySQL
        port in security groups to specific IPs`;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allSecurityGroups) {
            const regionSecurityGroups = allSecurityGroups[region];
            allRegionsAnalysis[region] = [];
            for (const securityGroup of regionSecurityGroups) {
                if (securityGroup.GroupName === "default") {
                    continue;
                }
                const securityGroupAnalysis: IResourceAnalysisResult = {};
                securityGroupAnalysis.resource = securityGroup;
                securityGroupAnalysis.resourceSummary = {
                    name: "SecurityGroup",
                    value: `${securityGroup.GroupName} | ${securityGroup.GroupId}`,
                };
                if (this.isMySQLOpenToWorld(securityGroup)) {
                    securityGroupAnalysis.severity = SeverityStatus.Failure;
                    securityGroupAnalysis.message = "MySQL Port is open to entire world";
                    securityGroupAnalysis.action = "Restrict MySQL port";
                } else {
                    securityGroupAnalysis.severity = SeverityStatus.Good;
                    securityGroupAnalysis.message = "MySQL port is not open to entire world";
                }
                allRegionsAnalysis[region].push(securityGroupAnalysis);
            }
        }
        mysql_db_port_open_to_world.regions = allRegionsAnalysis;
        return { mysql_db_port_open_to_world };
    }

    private isMySQLOpenToWorld(securityGroup: any) {
        if (!securityGroup) {
            return false;
        }

        return securityGroup.IpPermissions.some((rule) => {
            return rule.FromPort === 3306 && rule.IpRanges.some((ipRange) => {
                return ipRange.CidrIp === "0.0.0.0/0";
            });
        });
    }
}
