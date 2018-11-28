import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class VolumesEncryptionEnabledAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allVolumes = params.volumes;
        if (!allVolumes) {
            return undefined;
        }
        const volumes_encrypted_at_rest: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        volumes_encrypted_at_rest.what = "Are EBS volumes encrypted at rest?";
        volumes_encrypted_at_rest.why = "Data at rest should always be encrypted";
        volumes_encrypted_at_rest.recommendation = "Recommended to enable encryption for EBS volumes";
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
                if (volume.Encrypted) {
                    volumeAnalysis.severity = SeverityStatus.Good;
                    volumeAnalysis.message = "Encryption enabled";
                } else {
                    volumeAnalysis.severity = SeverityStatus.Warning;
                    volumeAnalysis.message = "Encryption not enabled";
                    volumeAnalysis.action = "Enable encryption at rest";
                }
                allRegionsAnalysis[region].push(volumeAnalysis);
            }
        }
        volumes_encrypted_at_rest.regions = allRegionsAnalysis;
        return { volumes_encrypted_at_rest };
    }
}
