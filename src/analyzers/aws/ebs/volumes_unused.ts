import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';
import { ResourceUtil } from '../../../utils';

export class VolumesUsageAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allVolumes = params.volumes;
        if ( !allVolumes) {
            return undefined;
        }
        const volumes_unused: CheckAnalysisResult = { type: CheckAnalysisType.CostOptimization };
        volumes_unused.what = "Are there any EBS unused volumes?";
        volumes_unused.why = "EBS volumes are costly resources so you should take snapshot and deleted the unused volumes"
        volumes_unused.recommendation = "Recommended to delete unused EBS volumes once snapshot is taken incase if there will be need for that data later";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allVolumes) {
            let regionVolumes = allVolumes[region];
            allRegionsAnalysis[region] = [];
            for (let volume of regionVolumes) {
                let volumeAnalysis: ResourceAnalysisResult = {};
                volumeAnalysis.resource = volume ;
                volumeAnalysis.resourceSummary = {
                    name: 'Volume',
                    value: `${ResourceUtil.getNameByTags(volume)} | ${volume.VolumeId}`
                }
                if (volume.Attachments && volume.Attachments.length) {
                    volumeAnalysis.severity = SeverityStatus.Good;
                    volumeAnalysis.message = `Volume is attached to ${volume.Attachments[0].InstanceId}`;
                } else {
                    volumeAnalysis.severity = SeverityStatus.Warning;
                    volumeAnalysis.message = 'Volume is not attached';
                    volumeAnalysis.action = 'Delete the volume after taking the snapshot';                    
                }
                allRegionsAnalysis[region].push(volumeAnalysis);
            }
        }
        volumes_unused.regions = allRegionsAnalysis;
        return { volumes_unused };
    }
}