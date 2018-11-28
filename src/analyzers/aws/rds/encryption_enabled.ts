import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class RdsEncryptionEnabledAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        if (!allInstances) {
            return undefined;
        }
        const encryption_enabled: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        encryption_enabled.what = "Is encryption enabled for RDS instances?";
        encryption_enabled.why = "It is important to encrypt data at rest";
        encryption_enabled.recommendation = `Recommended to enable encryption for
        RDS instance as it provides additional layer of security`;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allInstances) {
            const regionInstances = allInstances[region];
            allRegionsAnalysis[region] = [];
            for (const instance of regionInstances) {
                const instance_analysis: IResourceAnalysisResult = {};
                instance_analysis.resource = instance;
                instance_analysis.resourceSummary = {
                    name: "DBInstance",
                    value: instance.DBInstanceIdentifier,
                };
                if (instance.StorageEncrypted) {
                    instance_analysis.severity = SeverityStatus.Good;
                    instance_analysis.message = "RDS instance is encrypted at rest";
                } else {
                    instance_analysis.severity = SeverityStatus.Failure;
                    instance_analysis.message = "RDS instance is not encrypted at rest";
                    instance_analysis.action = "Enable storage encryption at rest for the instance";
                }
                allRegionsAnalysis[region].push(instance_analysis);
            }
        }
        encryption_enabled.regions = allRegionsAnalysis;
        return { encryption_enabled };
    }
}
