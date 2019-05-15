import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class VolumesEncryptionEnabledAnalyzer extends BaseAnalyzer {
    public checks_what : string = "Are EBS volumes encrypted at rest?";
    public checks_why : string =  "Data at rest should always be encrypted";
    public checks_recommendation: string = "Recommended to enable encryption for EBS volumes";
    public checks_name : string = "Volume";
    public analyze(params: any, fullReport?: any): any {
        const allVolumes = params.volumes;
        if (!allVolumes) {
            return undefined;
        }
        const volumes_encrypted_at_rest: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        volumes_encrypted_at_rest.what = this.checks_what;
        volumes_encrypted_at_rest.why =this.checks_why;
        volumes_encrypted_at_rest.recommendation = this.checks_recommendation;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allVolumes) {
            const regionVolumes = allVolumes[region];
            allRegionsAnalysis[region] = [];
            for (const volume of regionVolumes) {
                const volumeAnalysis: IResourceAnalysisResult = {};
                volumeAnalysis.resource = volume;
                volumeAnalysis.resourceSummary = {
                    name: this.checks_name,
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
