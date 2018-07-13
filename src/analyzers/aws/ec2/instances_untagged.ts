import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';
import { ResourceUtil } from '../../../utils';

export class InstanceUntaggedAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        if ( !allInstances) {
            return undefined;
        }
        const untagged_instances: CheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        untagged_instances.what = "Are there EC2 any instances without tags?";
        untagged_instances.why = "Tags help to follow security practices easily"
        untagged_instances.recommendation = "Recommended to add tags to all instances";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allInstances) {
            let regionInstances = allInstances[region];
            allRegionsAnalysis[region] = [];
            for (let instance of regionInstances) {
                let instanceAnalysis: ResourceAnalysisResult = {};
                instanceAnalysis.resource = { instanceName: ResourceUtil.getNameByTags(instance), instanceId: instance.InstanceId, security_groups: instance.SecurityGroups } ;
                instanceAnalysis.resourceSummary = {
                    name: 'Instance',
                    value: `${instanceAnalysis.resource.instanceName} | ${instance.InstanceId}`
                }
                if (instance.Tags.length === 0) {
                    instanceAnalysis.severity = SeverityStatus.Failure;
                    instanceAnalysis.message = 'No tags';
                    instanceAnalysis.action = 'Add tags for the instance';
                } else {
                    instanceAnalysis.severity = SeverityStatus.Good;
                    instanceAnalysis.message = 'Tags are present';
                }
                allRegionsAnalysis[region].push(instanceAnalysis);
            }
        }
        untagged_instances.regions = allRegionsAnalysis;
        return { untagged_instances };
    }
}