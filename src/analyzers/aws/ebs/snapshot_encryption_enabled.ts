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
        if (!allVolumes || !allSnapshots) {
            return undefined;
        }
        const snapshots_encryption_enabled: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        snapshots_encryption_enabled.what = "Are EBS snapshots are encryptedt?";
        snapshots_encryption_enabled.why = "Snapshots should always be encrypted when data is at rest.";
        snapshots_encryption_enabled.recommendation = "Recommended to enable encryption for EBS snapshots.";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allVolumes) {
            const regionVolumes = allVolumes[region];
            allRegionsAnalysis[region] = [];
            for (const snapshots of regionVolumes) {
                const snapshotsAnalysis: IResourceAnalysisResult = {};
                snapshotsAnalysis.resource = snapshots;
                snapshotsAnalysis.resourceSummary = {
                    name: "Snapshots",
                    value: `${ResourceUtil.getNameByTags(snapshots)} | ${snapshots.Encrypted}`,
                };
                if (snapshots.Encrypted) {
                    snapshotsAnalysis.severity = SeverityStatus.Good;
                    snapshotsAnalysis.message = "Encryption enabled.";
                } else {
                    snapshotsAnalysis.severity = SeverityStatus.Warning;
                    snapshotsAnalysis.message = "Encryption not enabled.";
                    snapshotsAnalysis.action = "Enable encryption at rest.";
                }
                allRegionsAnalysis[region].push(snapshotsAnalysis);
            }
        }
        snapshots_encryption_enabled.regions = allRegionsAnalysis;
        return { snapshots_encryption_enabled };
    }
}
