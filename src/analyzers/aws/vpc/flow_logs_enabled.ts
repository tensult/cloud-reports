import { BaseAnalyzer } from '../../base'
import { ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisResult, CheckAnalysisType } from '../../../types';

export class FlowLogsEnabledAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allFlowLogs = params.flow_logs;
        const allVpcs = params.vpcs;
        if (!allFlowLogs || !allVpcs) {
            return undefined;
        }
        const flow_logs_enabled: CheckAnalysisResult = {type: CheckAnalysisType.Security};
        flow_logs_enabled.what = "Is flow logs enabled for vpc?";
        flow_logs_enabled.why = "VPC flow logs tells about the request patterns and helps to detect security threats"
        flow_logs_enabled.recommendation = "Recommended to enable flow logs for vpcs";
        const allRegionsAnalysis: Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allVpcs) {
            let regionVpcs = allVpcs[region];
            let regionFlowLogs = allFlowLogs[region];
            allRegionsAnalysis[region] = [];
            for (let vpc of regionVpcs) {
                if (vpc.IsDefault) {
                    continue;
                }
                let flow_log_analysis: ResourceAnalysisResult = {};
                flow_log_analysis.resource = this.getVpcFlowLogs(regionFlowLogs, vpc.VpcId);
                flow_log_analysis.resourceSummary = {
                    name: 'Vpc', value: vpc.VpcId
                } 
                if (flow_log_analysis.resource.length) {
                    flow_log_analysis.severity = SeverityStatus.Good;
                    flow_log_analysis.message = 'VPC flow logs are enabled';
                } else {
                    flow_log_analysis.severity = SeverityStatus.Failure;
                    flow_log_analysis.message = 'VPC flow logs are not enabled';
                    flow_log_analysis.action = 'Enable vpc flow logs for debugging access requests to the VPC'
                }
                allRegionsAnalysis[region].push(flow_log_analysis);
            }
        }
        flow_logs_enabled.regions = allRegionsAnalysis;
        return { flow_logs_enabled };
    }

    private getVpcFlowLogs(flowLogs: any[], vpcId) {
        return flowLogs.filter((flowLog) => {
            return flowLog.ResourceId === vpcId && flowLog.FlowLogStatus === 'ACTIVE';
        });
    }
}