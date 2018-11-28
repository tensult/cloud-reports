import {
    CheckAnalysisType, ICheckAnalysisResult,
    IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class RdsDeleteProtectionEnabledAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        if (!allInstances) {
            return undefined;
        }
        const delete_protection_enabled: ICheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        delete_protection_enabled.what = "Is delete protection enabled for RDS instances?";
        delete_protection_enabled.why = `Enabling delete protection for all production
        RDS instances, protects them from accidental deletion.`;
        delete_protection_enabled.recommendation = `Recommended to enable delete
         protection for all production RDS instances.`;
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
                if (instance.DeletionProtection) {
                    instance_analysis.severity = SeverityStatus.Good;
                    instance_analysis.message = "Deletion Protection enabled";
                } else {
                    instance_analysis.severity = SeverityStatus.Failure;
                    instance_analysis.message = "Deletion Protection not enabled";
                    instance_analysis.action = "Enable deletion protection for all production instances";
                }
                allRegionsAnalysis[region].push(instance_analysis);
            }
        }
        delete_protection_enabled.regions = allRegionsAnalysis;
        return { delete_protection_enabled };
    }
}
