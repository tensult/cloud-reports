
import { BaseAnalyzer } from '../../base'
import { ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisResult, CheckAnalysisType } from '../../../types';

export class RdsPubliclyAccessibleAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        if (!allInstances) {
            return undefined;
        }
        const publicly_accessible: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        publicly_accessible.what = "Are there any publicly accessible RDS instances?";
        publicly_accessible.why = "It is important to restrict RDS instances for private access only for most of the usecases"
        publicly_accessible.recommendation = "Recommended to disable public access for RDS instances";
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
                if (instance.PubliclyAccessible) {
                    instance_analysis.severity = SeverityStatus.Warning;
                    instance_analysis.message = 'RDS instance is publicly accessible';
                    instance_analysis.action = 'Recommended to access Database instance privately'
                } else {
                    instance_analysis.severity = SeverityStatus.Good;
                    instance_analysis.message = 'RDS instance is not publicly accessible';
                }
                allRegionsAnalysis[region].push(instance_analysis);
            }
        }
        publicly_accessible.regions = allRegionsAnalysis;
        return { publicly_accessible };
    }
}