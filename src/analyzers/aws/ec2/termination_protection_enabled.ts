import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';
import { ResourceUtil } from '../../../utils';

export class TerminationProtectionEnabledAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allTerminationProtectionStatuses = params.termination_protection;
        const allInstances = params.instances;
        if (!allTerminationProtectionStatuses || !allInstances) {
            return undefined;
        }
        const termination_protection_enabled: CheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        termination_protection_enabled.what = "Are there any instances without termination protection?";
        termination_protection_enabled.why = "Instances can be accidentally terminated and data can be lost when they are without termination protection"
        termination_protection_enabled.recommendation = "Recommended to enable termination protection for all production critical instances";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allInstances) {
            let regionInstances = allInstances[region];
            allRegionsAnalysis[region] = [];
            for (let instance of regionInstances) {
                let instanceAnalysis: ResourceAnalysisResult = {};
                instanceAnalysis.resource = { instanceName: ResourceUtil.getNameByTags(instance), instanceId: instance.InstanceId, termination_protection: allTerminationProtectionStatuses[region][instance.InstanceId] } ;
                instanceAnalysis.resourceSummary = {
                    name: 'Instance',
                    value: `${instanceAnalysis.resource.instanceName} | ${instance.InstanceId}`
                }
                if (allTerminationProtectionStatuses[region][instance.InstanceId].Value) {
                    instanceAnalysis.severity = SeverityStatus.Good;
                    instanceAnalysis.message = 'Already enabled';
                } else {
                    instanceAnalysis.severity = SeverityStatus.Warning;
                    instanceAnalysis.message = 'Not enabled';
                    instanceAnalysis.action = 'Enable termination protection';                    
                }
                allRegionsAnalysis[region].push(instanceAnalysis);
            }
        }
        termination_protection_enabled.regions = allRegionsAnalysis;
        return { termination_protection_enabled };
    }
}