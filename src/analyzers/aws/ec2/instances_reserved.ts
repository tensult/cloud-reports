import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';
import { ResourceUtil, CommonUtil } from '../../../utils';

export class EC2InstancesReservationAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        const allReservedInstances = params.reserved_instances;
        if (!allInstances || !allReservedInstances) {
            return undefined;
        }
        const instances_reserved: CheckAnalysisResult = { type: CheckAnalysisType.CostOptimization };
        instances_reserved.what = "Are there any long running instances which should be reserved?";
        instances_reserved.why = "You can reserve the EC2 instance which are you going to run for long time to save the cost."
        instances_reserved.recommendation = "Recommended to reserve all long running instances";
        const allRegionsAnalysis: Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allInstances) {
            let regionInstances = allInstances[region];
            allRegionsAnalysis[region] = [];
            for (let instance of regionInstances) {
                if (instance.State.Name !== 'running') {
                    continue;
                }
                let instanceAnalysis: ResourceAnalysisResult = {};
                instanceAnalysis.resource = instance;
                instanceAnalysis.resourceSummary = {
                    name: 'Instance',
                    value: `${ResourceUtil.getNameByTags(instance)} | ${instance.InstanceId}`
                }
                const runningFromDays = CommonUtil.daysFrom(instance.LaunchTime)
                if (runningFromDays > 365) {
                    if(this.isInstanceReserved(allReservedInstances[region], instance)) {
                        instanceAnalysis.severity = SeverityStatus.Good;
                        instanceAnalysis.message = 'Instance is already reserved';
                    } else {
                        instanceAnalysis.severity = SeverityStatus.Warning;
                        instanceAnalysis.message = `Instance is running from ${runningFromDays} days`;
                        instanceAnalysis.action = 'Reserve the instance to save costs';
                    }
                } else {
                    instanceAnalysis.severity = SeverityStatus.Info;
                    instanceAnalysis.message = `Instance is running from ${runningFromDays} days`;
                }
                allRegionsAnalysis[region].push(instanceAnalysis);
            }
        }
        instances_reserved.regions = allRegionsAnalysis;
        return { instances_reserved };
    }

    private isInstanceReserved(reservedInstances, instance) {
        if(!reservedInstances || !reservedInstances.length) {
            return false;
        }
    

    }

}