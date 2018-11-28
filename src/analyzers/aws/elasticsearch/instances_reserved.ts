import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class ESInstancesReservationAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allDomains = params.domains;
        const allReservedInstances = params.reserved_instances;
        if (!allDomains || !allReservedInstances) {
            return undefined;
        }
        const instances_reserved: ICheckAnalysisResult = { type: CheckAnalysisType.CostOptimization };
        instances_reserved.what = "Are Elasticsearch Instances reserved?";
        instances_reserved.why = `You can reserve the Elasticsearch Service domain
        which are you going to run for long time to save the cost.`;
        instances_reserved.recommendation = "Recommended to reserve all long running instances";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allDomains) {
            const regionDomains = allDomains[region];
            allRegionsAnalysis[region] = [];
            const instanceCountMap = this.getCountOfInstancesReservedByInstanceType(allReservedInstances[region]);
            for (const domain of regionDomains) {
                if (!domain.ElasticsearchClusterConfig) {
                    continue;
                }
                const instanceType = domain.ElasticsearchClusterConfig.InstanceType;
                let instanceCount = domain.ElasticsearchClusterConfig.InstanceCount;
                const masterInstanceType = domain.ElasticsearchClusterConfig.InstanceType;
                const masterInstanceCount = domain.ElasticsearchClusterConfig.DedicatedMasterCount;

                const domainInstancesAnalysis: IResourceAnalysisResult = {};
                domainInstancesAnalysis.resource = domain;
                domainInstancesAnalysis.resourceSummary = {
                    name: "DomainInstanceType",
                    value: `${domain.DomainName} | ${instanceType}`,
                };

                const dedicatedMasterEnabled = domain.ElasticsearchClusterConfig.DedicatedMasterEnabled;
                if (dedicatedMasterEnabled && instanceType === masterInstanceType) {
                    instanceCount += masterInstanceCount;
                }
                if (this.getInstancesReservedCount(instanceCountMap, instanceType, instanceCount) === instanceCount) {
                    domainInstancesAnalysis.severity = SeverityStatus.Good;
                    domainInstancesAnalysis.message = "All Instances are reserved";
                } else {
                    domainInstancesAnalysis.severity = SeverityStatus.Warning;
                    domainInstancesAnalysis.message = "Some of the Instances are not reserved";
                    domainInstancesAnalysis.action = "Reserve the instances to save costs";
                }

                allRegionsAnalysis[region].push(domainInstancesAnalysis);

                if (dedicatedMasterEnabled && instanceType !== masterInstanceType) {
                    const domainMasterInstancesAnalysis: IResourceAnalysisResult = {};
                    domainMasterInstancesAnalysis.resource = domain;
                    domainMasterInstancesAnalysis.resourceSummary = {
                        name: "DomainInstanceType",
                        value: `${domain.DomainName} | ${masterInstanceType}`,
                    };
                    if (this.getInstancesReservedCount(instanceCountMap,
                        masterInstanceType, masterInstanceCount) === masterInstanceCount) {
                        domainMasterInstancesAnalysis.severity = SeverityStatus.Good;
                        domainMasterInstancesAnalysis.message = "All Instances are reserved";
                    } else {
                        domainMasterInstancesAnalysis.severity = SeverityStatus.Warning;
                        domainMasterInstancesAnalysis.message = "Some of the Instances are not reserved";
                        domainMasterInstancesAnalysis.action = "Reserve the instances to save costs";
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
            return reservedInstance.State === "active";
        }).reduce((instanceCountMap, reservedInstance) => {
            instanceCountMap[reservedInstance.ElasticsearchInstanceType]
                = instanceCountMap[reservedInstance.ElasticsearchInstanceType] || { actual: 0, used: 0 };
            instanceCountMap[reservedInstance.ElasticsearchInstanceType].actual
                += reservedInstance.ElasticsearchInstanceCount;
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
