import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class PostgreSQLPortOpenToWorldAnalyzer extends BaseAnalyzer {
    analyze(params: any, fullReport?: any): any {
        const allSecurityGroups = params.security_groups;
        if (!allSecurityGroups) {
            return undefined;
        }
        const postgre_sql_db_port_open_to_world: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        postgre_sql_db_port_open_to_world.what = "Is PostgreSQL port open to world?";
        postgre_sql_db_port_open_to_world.why = "We should always restrict PostgreSQL port only intended parties to access";
        postgre_sql_db_port_open_to_world.recommendation = "Recommended to restrict PostgreSQL port in security groups to specific IPs";
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
                if (this.isPostgreSQLOpenToWorld(securityGroup)) {
                    securityGroupAnalysis.severity = SeverityStatus.Failure;
                    securityGroupAnalysis.message = 'PostgreSQL Port is open to entire world';
                    securityGroupAnalysis.action = 'Restrict PostgreSQL port'
                } else {
                    securityGroupAnalysis.severity = SeverityStatus.Good;
                    securityGroupAnalysis.message = 'PostgreSQL port is not open to entire world';
                }
                allRegionsAnalysis[region].push(securityGroupAnalysis);
            }
        }
        postgre_sql_db_port_open_to_world.regions = allRegionsAnalysis;
        return { postgre_sql_db_port_open_to_world };
    }

    private isPostgreSQLOpenToWorld(securityGroup: any) {
        if(securityGroup) {
            return false;
        }
        const openIpRanges = securityGroup.IpPermissions.filter((rule) => {
            return rule.FromPort === 5432 && rule.IpRanges.findIndex((ipRange) => {
                return ipRange.CidrIp === '0.0.0.0/0';
            }) !== -1;
        });
        return openIpRanges.length > 0;
    }
}