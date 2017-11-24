import { BaseAnalyzer } from '../../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus } from '../../../../types';

export class InstanceUntaggedAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        if ( !allInstances) {
            return undefined;
        }
        const untagged_instances: CheckAnalysisResult = {};
        untagged_instances.what = "Are there EC2 any instances without tags?";
        untagged_instances.why = "Tags help to follow security practices easily"
        untagged_instances.recommendation = "Recommended to add tags to all instances";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allInstances) {
            let regionInstances = allInstances[region];
            allRegionsAnalysis[region] = [];
            for (let instance of regionInstances) {
                let instanceAnalysis: ResourceAnalysisResult = {};
                instanceAnalysis.resource = { instanceName: this.getName(instance), instanceId: instance.InstanceId, security_groups: instance.SecurityGroups } ;
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

    private getName(instance: any) {
        const nameTags = instance.Tags.filter((tag) => {
            return tag.Key == 'Name';
        });
        if (nameTags.length) {
            return nameTags[0].Value;
        } else {
            return 'Unassigned';
        }
    }

    private getTagKeys(instance: any) {
        return instance.Tags.map((tag) => {
            return tag.Key;
        });
    }
}