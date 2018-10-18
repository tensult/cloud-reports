import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class MSSQLPortOpenToWorldAnalyzer extends BaseAnalyzer {
    analyze(params: any, fullReport?: any): any {
        const allSecurityGroups = params.security_groups;
        if (!allSecurityGroups) {
            return undefined;
        }
        const mssql_db_port_open_to_world: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        mssql_db_port_open_to_world.what = "Is MSSQL port open to world?";
        mssql_db_port_open_to_world.why = "We should always restrict MSSQL port only intended parties to access";
        mssql_db_port_open_to_world.recommendation = "Recommended to restrict MSSQL port in security groups to specific IPs";
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
                if (this.isMSSQLOpenToWorld(securityGroup)) {
                    securityGroupAnalysis.severity = SeverityStatus.Failure;
                    securityGroupAnalysis.message = 'MSSQL Port is open to entire world';
                    securityGroupAnalysis.action = 'Restrict MSSQL port'
                } else {
                    securityGroupAnalysis.severity = SeverityStatus.Good;
                    securityGroupAnalysis.message = 'MSSQL port is not open to entire world';
                }
                allRegionsAnalysis[region].push(securityGroupAnalysis);
            }
        }
        mssql_db_port_open_to_world.regions = allRegionsAnalysis;
        return { mssql_db_port_open_to_world };
    }

    private isMSSQLOpenToWorld(securityGroup: any) {
        if(!securityGroup) {
            return false;
        }

        return securityGroup.IpPermissions.some((rule) => {
            return rule.FromPort === 1433 && rule.IpRanges.some((ipRange) => {
                return ipRange.CidrIp === '0.0.0.0/0';
            });
        });
    }
}