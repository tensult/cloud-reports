import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';
import { ResourceUtil } from '../../../utils';

export class EC2VolumeDeleteProtectionOnTerminationAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allTerminationProtectionStatuses = params.termination_protection;
        const allInstances = params.instances;
        if (!allTerminationProtectionStatuses || !allInstances) {
            return undefined;
        }
        const volume_delete_protection_enabled: CheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        volume_delete_protection_enabled.what = "Are there any instances without deletion protection for volumes?";
        volume_delete_protection_enabled.why = "Instances can be accidentally terminated and data can be lost when they are without deletion protection for volumes"
        volume_delete_protection_enabled.recommendation = "Recommended to enable deletion protection for volumes attached to all production critical instances";
        const allRegionsAnalysis: Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allInstances) {
            let regionInstances = allInstances[region];
            allRegionsAnalysis[region] = [];
            for (let instance of regionInstances) {
                if (!instance.BlockDeviceMappings || !instance.BlockDeviceMappings.length) {
                    continue;
                }
                for (let volume of instance.BlockDeviceMappings) {
                    let instanceAnalysis: ResourceAnalysisResult = {};
                    instanceAnalysis.resource = { instanceName: ResourceUtil.getNameByTags(instance), instanceId: instance.InstanceId, volume };
                    instanceAnalysis.resourceSummary = {
                        name: 'Instance-Volume',
                        value: `${instanceAnalysis.resource.instanceName} | ${instance.InstanceId} - ${volume.DeviceName}`
                    }
                    if (!volume.Ebs.DeleteOnTermination) {
                        instanceAnalysis.severity = SeverityStatus.Good;
                        instanceAnalysis.message = 'Already enabled';
                    } else {
                        instanceAnalysis.severity = SeverityStatus.Warning;
                        instanceAnalysis.message = 'Not enabled';
                        instanceAnalysis.action = 'Enable deletion protection';
                    }
                    allRegionsAnalysis[region].push(instanceAnalysis);
                }
            }
        }
        volume_delete_protection_enabled.regions = allRegionsAnalysis;
        return { volume_delete_protection_enabled };
    }
}