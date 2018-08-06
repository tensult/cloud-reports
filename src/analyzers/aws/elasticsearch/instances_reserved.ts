import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class ESInstancesReservationAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allDomains = params.domains;
        const allReservedInstances = params.reserved_instances;
        if (!allDomains || !allReservedInstances) {
            return undefined;
        }
        const instances_reserved: CheckAnalysisResult = { type: CheckAnalysisType.CostOptimization };
        instances_reserved.what = "Are Elasticsearch Instances reserved?";
        instances_reserved.why = "You can reserve the Elasticsearch Service domain which are you going to run for long time to save the cost."
        instances_reserved.recommendation = "Recommended to reserve all long running instances";
        const allRegionsAnalysis: Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allDomains) {
            let regionDomains = allDomains[region];
            allRegionsAnalysis[region] = [];
            let instanceCountMap = this.getCountOfInstancesReservedByInstanceType(allReservedInstances[region]);
            for (let domain of regionDomains) {
                if (!domain.ElasticsearchClusterConfig) {
                    continue;
                }
                let instanceType = domain.ElasticsearchClusterConfig.InstanceType;
                let instanceCount = domain.ElasticsearchClusterConfig.InstanceCount;
                let masterInstanceType = domain.ElasticsearchClusterConfig.InstanceType;
                let masterInstanceCount = domain.ElasticsearchClusterConfig.DedicatedMasterCount;

                let domainInstancesAnalysis: ResourceAnalysisResult = {};
                domainInstancesAnalysis.resource = domain;
                domainInstancesAnalysis.resourceSummary = {
                    name: 'DomainInstanceType',
                    value: `${domain.DomainName} | ${instanceType}`
                }

                let dedicatedMasterEnabled = domain.ElasticsearchClusterConfig.DedicatedMasterEnabled;
                if (dedicatedMasterEnabled && instanceType === masterInstanceType) {
                    instanceCount += masterInstanceCount;
                }
                if (this.getInstancesReservedCount(instanceCountMap, instanceType, instanceCount) === instanceCount) {
                    domainInstancesAnalysis.severity = SeverityStatus.Good;
                    domainInstancesAnalysis.message = 'All Instances are reserved';
                } else {
                    domainInstancesAnalysis.severity = SeverityStatus.Warning;
                    domainInstancesAnalysis.message = 'Some of the Instances are not reserved';
                    domainInstancesAnalysis.action = 'Reserve the instances to save costs';
                }

                allRegionsAnalysis[region].push(domainInstancesAnalysis);

                if (dedicatedMasterEnabled && instanceType !== masterInstanceType) {
                    let domainMasterInstancesAnalysis: ResourceAnalysisResult = {};
                    domainMasterInstancesAnalysis.resource = domain;
                    domainMasterInstancesAnalysis.resourceSummary = {
                        name: 'DomainInstanceType',
                        value: `${domain.DomainName} | ${masterInstanceType}`
                    }
                    if (this.getInstancesReservedCount(instanceCountMap, masterInstanceType, masterInstanceCount) === masterInstanceCount) {
                        domainMasterInstancesAnalysis.severity = SeverityStatus.Good;
                        domainMasterInstancesAnalysis.message = 'All Instances are reserved';
                    } else {
                        domainMasterInstancesAnalysis.severity = SeverityStatus.Warning;
                        domainMasterInstancesAnalysis.message = 'Some of the Instances are not reserved';
                        domainMasterInstancesAnalysis.action = 'Reserve the instances to save costs';
                    }
                    allRegionsAnalysis[region].push(domainMasterInstancesAnalysis);
                }
            }
        }
        instances_reserved.regions = allRegionsAnalysis;
        return { instances_reserved };
    }

    private getCountOfInstancesReservedByInstanceType(reservedInstances) {
        if (!reservedInstances || !reservedInstances.length) {
            return {};
        }

        return reservedInstances.filter((reservedInstance) => {
            return reservedInstance.State === "active"
        }).reduce((instanceCountMap, reservedInstance) => {
            instanceCountMap[reservedInstance.ElasticsearchInstanceType] = instanceCountMap[reservedInstance.ElasticsearchInstanceType] || { actual: 0, used: 0 };
            instanceCountMap[reservedInstance.ElasticsearchInstanceType].actual += reservedInstance.ElasticsearchInstanceCount;
            return instanceCountMap;
        }, {});
    }

    private getInstancesReservedCount(instanceCountMap, instanceType, instanceCount) {
        const instanceCountObj = instanceCountMap[instanceType];
        if (!instanceCountObj) {
            return 0;
        }

        if (instanceCount <= instanceCountObj.actual - instanceCountObj.used) {
            instanceCountObj.used += instanceCount;
            return instanceCount;
        } else {
            instanceCountObj.used = instanceCountObj.actual;
            return instanceCountObj.actual - instanceCountObj.used;
        }
    }
}