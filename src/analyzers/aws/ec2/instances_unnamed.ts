import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class InstancesUnnamedAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        if ( !allInstances) {
            return undefined;
        }
        const unnamed_instances: CheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        unnamed_instances.what = "Are there any EC2 instances without Name tags";
        unnamed_instances.why = "Tags help to follow security practices easily"
        unnamed_instances.recommendation = "Recommended to add Name tag to all instances";
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
                if (instanceAnalysis.resource.instanceName === 'Unassigned') {
                    instanceAnalysis.severity = SeverityStatus.Warning;
                    instanceAnalysis.message = 'No Name tag';
                    instanceAnalysis.action = 'Add Name tag';
                } else {
                    instanceAnalysis.severity = SeverityStatus.Good;
                    instanceAnalysis.message = `Name tag is present`;
                }
                allRegionsAnalysis[region].push(instanceAnalysis);
            }
        }
        unnamed_instances.regions = allRegionsAnalysis;
        return { unnamed_instances };
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
}