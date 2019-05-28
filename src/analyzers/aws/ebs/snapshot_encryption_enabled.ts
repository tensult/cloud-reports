import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class SnapshotEncryptionEnabledAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allVolumes = params.volumes;
        const allSnapshots = params.snapshots;
        if (!allVolumes||!allSnapshots) {
            return undefined;
        }
       const snapshots_encryption_enabled: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
       snapshots_encryption_enabled.what = "Are EBS volumes encrypted at rest?";
       snapshots_encryption_enabled.why = "Data at rest should always be encrypted";
       snapshots_encryption_enabled.recommendation = "Recommended to enable encryption for EBS volumes";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allVolumes) {
            const regionVolumes = allVolumes[region];
            allRegionsAnalysis[region] = [];
            for (const snapshots of regionVolumes) {
                const snapshotsAnalysis: IResourceAnalysisResult = {};
                snapshotsAnalysis.resource = {snapshots: allSnapshots[region]};
                //console.log("snapshots",snapshots)
                snapshotsAnalysis.resourceSummary = {
                    name: "Volume",
                    value: `${snapshots.Progress} | ${snapshots.Encrypted}`,
                };
                const Encrpyt = snapshots.Encrypted;
                console.log("encryption",Encrpyt);
                if (Encrpyt.indexOf("false") != -1) {
                    snapshotsAnalysis.severity = SeverityStatus.Good;
                    snapshotsAnalysis.message = "Encryption enabled";
                    console.log("encryption",Encrpyt);
                } else {
                    snapshotsAnalysis.severity = SeverityStatus.Warning;
                    snapshotsAnalysis.message = "Encryption not enabled";
                    snapshotsAnalysis.action = "Enable encryption at rest";
                }
                allRegionsAnalysis[region].push(snapshotsAnalysis);
            }
        }
       snapshots_encryption_enabled.regions = allRegionsAnalysis;
        return {snapshots_encryption_enabled };
    }
    // private getEncryptionData(snapshots: any[]){

    //     const encrypt = snapshots.Encrypted;
    //     return encrypt;
    // } 
}
