import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class VisibilityTimeoutAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allQueuess = params.queue_attributes;
        if ( !allQueuess) {
            return undefined;
        }
        const low_visibility_timeout: CheckAnalysisResult = { type: CheckAnalysisType.PerformanceEfficiency };
        low_visibility_timeout.what = "Is SQS Queue VisibilityTimeout too low?";
        low_visibility_timeout.why = "We need to set proper VisibilityTimeout for the queues otherwise messages will be processed multiple times and they will become available to other consumers while they are being processed; this will have performance impact."
        low_visibility_timeout.recommendation = "Recommended to set VisibilityTimeout higher than the maximum processing time of the messages";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allQueuess) {
            let regionQueuess = allQueuess[region];
            allRegionsAnalysis[region] = [];
            for (let queueUrl in regionQueuess) {
                let queueAnalysis: ResourceAnalysisResult = {};
                let queueName = this.getQueueName(queueUrl);
                queueAnalysis.resource = {queueName, attributes:  regionQueuess[queueUrl]};
                queueAnalysis.resourceSummary = {
                    name: 'Queue',
                    value: queueName
                }
                if (regionQueuess[queueUrl].VisibilityTimeout > 5) {
                    queueAnalysis.severity = SeverityStatus.Good;
                    queueAnalysis.message = `Visibility Timeout is ${regionQueuess[queueUrl].VisibilityTimeout}`;
                    queueAnalysis.action = 'Make sure that Visibility Timeout is higher than the maximum processing time of the messages';                    
                } else {
                    queueAnalysis.severity = SeverityStatus.Warning;
                    queueAnalysis.message = `Visibility Timeout is ${regionQueuess[queueUrl].VisibilityTimeout}`;
                    queueAnalysis.action = 'Set Visibility Timeout higher than the maximum processing time of the messages';                    
                }
                allRegionsAnalysis[region].push(queueAnalysis);
            }
        }
        low_visibility_timeout.regions = allRegionsAnalysis;
        return { low_visibility_timeout };
    }

    private getQueueName(queueUrl) {
        return queueUrl.split('/').pop();
    }
}