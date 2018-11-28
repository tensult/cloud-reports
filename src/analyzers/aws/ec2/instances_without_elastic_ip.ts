import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class InstanceWithoutElasticIPAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        const allElasticIPs = params.elastic_ips;
        if (!allInstances || !allElasticIPs) {
            return undefined;
        }
        const instances_without_elastic_ip: ICheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        instances_without_elastic_ip.what = "Are there any EC2 instances without Elastic IP?";
        instances_without_elastic_ip.why = `We should attach Elastic IP to EC2 instances
        so that incase of instance failures we can easily
        replace the instance without losing the associated public IP`;
        instances_without_elastic_ip.recommendation = `Recommended to attach Elastic IP to EC2 instances which
        you are accessing via SSH or web application without a load balancer`;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allInstances) {
            const regionInstances = allInstances[region];
            const regionElasticIPs = allElasticIPs[region];
            allRegionsAnalysis[region] = [];
            for (const instance of regionInstances) {
                const instanceAnalysis: IResourceAnalysisResult = {};
                instanceAnalysis.resource = instance;
                instanceAnalysis.resourceSummary = {
                    name: "Instance",
                    value: `${ResourceUtil.getNameByTags(instance)} | ${instance.InstanceId}`,
                };
                if (this.isElasticIPAssociated(instance, regionElasticIPs)) {
                    instanceAnalysis.severity = SeverityStatus.Good;
                    instanceAnalysis.message = "Elastic IP is attached";
                } else {
                    instanceAnalysis.severity = SeverityStatus.Info;
                    instanceAnalysis.message = "Elastic IP is not attached";
                    instanceAnalysis.action = "Attach an Elastic IP";
                }
                allRegionsAnalysis[region].push(instanceAnalysis);
            }
        }
        instances_without_elastic_ip.regions = allRegionsAnalysis;
        return { instances_without_elastic_ip };
    }

    private isElasticIPAssociated(instance, elasticIps) {
        const publicENIs = instance.NetworkInterfaces.filter((networkInterface) => {
            return networkInterface.Association && networkInterface.Association.PublicIp;
        }).map((networkInterface) => {
            return networkInterface.NetworkInterfaceId;
        });
        return elasticIps.map((elasticIp) => {
            return elasticIp.NetworkInterfaceId;
        }).some((networkInterfaceId) => {
            return publicENIs.indexOf(networkInterfaceId) !== -1;
        });
    }
}
