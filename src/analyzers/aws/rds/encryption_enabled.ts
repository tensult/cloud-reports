import { BaseAnalyzer } from '../../base'
import { ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisResult, CheckAnalysisType } from '../../../types';

export class RdsEncryptionEnabledAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        if (!allInstances) {
            return undefined;
        }
        const encryption_enabled: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        encryption_enabled.what = "Is encryption enabled for RDS instances?";
        encryption_enabled.why = "It is important to encrypt data at rest"
        encryption_enabled.recommendation = "Recommended to enable encryption for instance storage";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allInstances) {
            let regionInstances = allInstances[region];
            allRegionsAnalysis[region] = [];
            for (let instance of regionInstances) {
                let instance_analysis: ResourceAnalysisResult = {};
                instance_analysis.resource = instance;
                instance_analysis.resourceSummary = {
                    name: 'DBInstance',
                    value: instance.DBInstanceIdentifier
                }
                if (instance.StorageEncrypted) {
                    instance_analysis.severity = SeverityStatus.Good;
                    instance_analysis.message = 'RDS instance is encrypted at rest';
                } else {
                    instance_analysis.severity = SeverityStatus.Failure;
                    instance_analysis.message = 'RDS instance is not encrypted at rest';
                    instance_analysis.action = 'Enable storage encryption at rest for the instance'
                }
                allRegionsAnalysis[region].push(instance_analysis);
            }
        }
        encryption_enabled.regions = allRegionsAnalysis;
        return { encryption_enabled };
    }
}