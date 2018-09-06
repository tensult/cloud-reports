import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType, Dictionary } from '../../../types';

export class SQSQueueSizeAlarmAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allAlarms: any[] = params.alarms;
        if (!allAlarms || !fullReport['aws.sqs'] || !fullReport['aws.sqs'].queue_urls) {
            return undefined;
        }
        const allQueueUrls: any[] = fullReport['aws.sqs'].queue_urls;

        const sqs_queue_size_alarm: CheckAnalysisResult = { type: [CheckAnalysisType.OperationalExcellence] };
        sqs_queue_size_alarm.what = "Are alarms are enabled for SQS Queue size?";
        sqs_queue_size_alarm.why = "It is important to set alarms for SQS Queue size as when the consumers are failing to process the messages from queue then we will get notified"
        sqs_queue_size_alarm.recommendation = "Recommended to set alarms for SQS Queue size to take appropriative action.";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allQueueUrls) {
            let regionQueues = allQueueUrls[region];
            let regionAlarms = allAlarms[region];
            let alarmsMapByQueue = this.mapAlarmsByQueue(regionAlarms);
            allRegionsAnalysis[region] = [];
            for (let queueUrl of regionQueues) {
                let alarmAnalysis: ResourceAnalysisResult = {};
                let queueName = queueUrl.split("/").pop();
                let queueAlarms =  alarmsMapByQueue[queueName];
                alarmAnalysis.resource = {queueName, alarms: queueAlarms};
                alarmAnalysis.resourceSummary = {
                    name: 'Queue',
                    value: queueName
                }
                
                if (this.isQueueSizeAlarmPresent(queueAlarms)) {
                    alarmAnalysis.severity = SeverityStatus.Good;
                    alarmAnalysis.message = "Queue Size alarm is enabled";
                } else {
                    alarmAnalysis.severity = SeverityStatus.Warning;
                    alarmAnalysis.message = "Queue Size alarm is not enabled";
                    alarmAnalysis.action = 'Set Queue Size alarm';               
                }
                allRegionsAnalysis[region].push(alarmAnalysis);
            }
        }
        sqs_queue_size_alarm.regions = allRegionsAnalysis;
        return { sqs_queue_size_alarm };
    }

    private mapAlarmsByQueue(alarms: any[]): Dictionary<any[]> {
        return alarms.reduce((alarmsMap, alarm) => {
            if(alarm.Namespace === 'AWS/SQS' && alarm.Dimensions) {
                const queueDimension = alarm.Dimensions.find((dimension) => {
                    return dimension.Name === 'QueueName';
                });
                if(queueDimension && queueDimension.Value) {
                    alarmsMap[queueDimension.Value] = alarmsMap[queueDimension.Value] || [];
                    alarmsMap[queueDimension.Value].push(alarm);

                }
            }
            return alarmsMap;
        }, {});
    }

    private isQueueSizeAlarmPresent(alarms) {
        return alarms && alarms.some((alarm) => {
            return alarm.ActionsEnabled && 
            alarm.AlarmActions &&
            alarm.AlarmActions.length &&
            alarm.MetricName.startsWith("ApproximateNumberOfMessages");
        });
    }
}