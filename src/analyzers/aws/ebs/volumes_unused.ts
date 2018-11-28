import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class VolumesUsageAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allVolumes = params.volumes;
        if (!allVolumes) {
            return undefined;
        }
        const volumes_unused: ICheckAnalysisResult = { type: CheckAnalysisType.CostOptimization };
        volumes_unused.what = "Are there any EBS unused volumes?";
        volumes_unused.why = `EBS volumes are costly resources so you should
        take snapshot and deleted the unused volumes`;
        volumes_unused.recommendation = `Recommended to delete unused EBS volumes
        once snapshot is taken incase if there will be need for that data later`;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allVolumes) {
            const regionVolumes = allVolumes[region];
            allRegionsAnalysis[region] = [];
            for (const volume of regionVolumes) {
                const volumeAnalysis: IResourceAnalysisResult = {};
                volumeAnalysis.resource = volume;
                volumeAnalysis.resourceSummary = {
                    name: "Volume",
                    value: `${ResourceUtil.getNameByTags(volume)} | ${volume.VolumeId}`,
                };
                if (volume.Attachments && volume.Attachments.length) {
                    volumeAnalysis.severity = SeverityStatus.Good;
                    volumeAnalysis.message = `Volume is attached to ${volume.Attachments[0].InstanceId}`;
                } else {
                    volumeAnalysis.severity = SeverityStatus.Warning;
                    volumeAnalysis.message = "Volume is not attached";
                    volumeAnalysis.action = "Delete the volume after taking the snapshot";
                }
                allRegionsAnalysis[region].push(volumeAnalysis);
            }
        }
        volumes_unused.regions = allRegionsAnalysis;
        return { volumes_unused };
    }
}
