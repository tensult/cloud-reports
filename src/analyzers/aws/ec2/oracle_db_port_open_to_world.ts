import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class OraclePortOpenToWorldAnalyzer extends BaseAnalyzer {
    analyze(params: any, fullReport?: any): any {
        const allSecurityGroups = params.security_groups;
        if (!allSecurityGroups) {
            return undefined;
        }
        const oracle_db_port_open_to_world: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        oracle_db_port_open_to_world.what = "Is Oracle port open to world?";
        oracle_db_port_open_to_world.why = "We should always restrict Oracle port only intended parties to access";
        oracle_db_port_open_to_world.recommendation = "Recommended to restrict Oracle port in security groups to specific IPs";
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
                if (this.isOracleOpenToWorld(securityGroup)) {
                    securityGroupAnalysis.severity = SeverityStatus.Failure;
                    securityGroupAnalysis.message = 'Oracle Port is open to entire world';
                    securityGroupAnalysis.action = 'Restrict Oracle port'
                } else {
                    securityGroupAnalysis.severity = SeverityStatus.Good;
                    securityGroupAnalysis.message = 'Oracle port is not open to entire world';
                }
                allRegionsAnalysis[region].push(securityGroupAnalysis);
            }
        }
        oracle_db_port_open_to_world.regions = allRegionsAnalysis;
        return { oracle_db_port_open_to_world };
    }

    private isOracleOpenToWorld(securityGroup: any) {
        if(!securityGroup) {
            return false;
        }

        return securityGroup.IpPermissions.some((rule) => {
            return rule.FromPort === 1521 && rule.IpRanges.some((ipRange) => {
                return ipRange.CidrIp === '0.0.0.0/0';
            });
        });
    }
}