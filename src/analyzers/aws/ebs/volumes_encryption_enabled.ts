import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class VolumesEncryptionEnabledAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allVolumes = params.volumes;
        if ( !allVolumes) {
            return undefined;
        }
        const volumes_encrypted_at_rest: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        volumes_encrypted_at_rest.what = "Are EBS volumes encrypted at rest?";
        volumes_encrypted_at_rest.why = "Data at rest should always be encrypted"
        volumes_encrypted_at_rest.recommendation = "Recommended to enable encryption for EBS volumes";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allVolumes) {
            let regionVolumes = allVolumes[region];
            allRegionsAnalysis[region] = [];
            for (let volume of regionVolumes) {
                let volumeAnalysis: ResourceAnalysisResult = {};
                volumeAnalysis.resource = volume ;
                volumeAnalysis.resourceSummary = {
                    name: 'Volume',
                    value: `${this.getName(volume)} | ${volume.VolumeId}`
                }
                if (volume.Encrypted) {
                    volumeAnalysis.severity = SeverityStatus.Good;
                    volumeAnalysis.message = 'Encryption enabled';
                } else {
                    volumeAnalysis.severity = SeverityStatus.Warning;
                    volumeAnalysis.message = 'Encryption not enabled';
                    volumeAnalysis.action = 'Enable encryption at rest';                    
                }
                allRegionsAnalysis[region].push(volumeAnalysis);
            }
        }
        volumes_encrypted_at_rest.regions = allRegionsAnalysis;
        return { volumes_encrypted_at_rest };
    }

    private getName(volume: any) {
        const nameTags = volume.Tags.filter((tag) => {
            return tag.Key == 'Name';
        });
        if (nameTags.length) {
            return nameTags[0].Value;
        } else {
            return 'Unassigned';
        }
    }
}