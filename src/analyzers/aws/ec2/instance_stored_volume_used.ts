import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class InstanceStoreVolumesAnalyzer extends BaseAnalyzer {
    public  checks_what : string = "Are there any EC2 instances with instance stored volumes";
    public  checks_why : string =  `Instance store volumes will lose the data
    in case the instance is failed or terminated`;
    public checks_recommendation: string = `Recommended to use EBS backed volumes
        as they can help us to recover data when instance has failed`;
    public checks_name : string = "Instance";
    public analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        if (!allInstances) {
            return undefined;
        }
        const instance_stored_volume_used: ICheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        instance_stored_volume_used.what = this.checks_what;
        instance_stored_volume_used.why = this.checks_why;
        instance_stored_volume_used.recommendation = this.checks_recommendation;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allInstances) {
            const regionInstances = allInstances[region];
            allRegionsAnalysis[region] = [];
            for (const instance of regionInstances) {
                const instanceAnalysis: IResourceAnalysisResult = {};
                instanceAnalysis.resource = {
                    instanceId: instance.InstanceId,
                    instanceName: ResourceUtil.getNameByTags(instance),
                    storageType: instance.RootDeviceType,
                };
                instanceAnalysis.resourceSummary = {
                    name: this.checks_name,
                    value: `${instanceAnalysis.resource.instanceName} | ${instance.InstanceId}`,
                };
                if (instance.RootDeviceType === "ebs") {
                    instanceAnalysis.severity = SeverityStatus.Good;
                    instanceAnalysis.message = "EBS backed volume is used";
                } else {
                    instanceAnalysis.severity = SeverityStatus.Failure;
                    instanceAnalysis.message = "Instance stored volume is used";
                    instanceAnalysis.action = "Switch to EBS backed volumes";

                }
                allRegionsAnalysis[region].push(instanceAnalysis);
            }
        }
        instance_stored_volume_used.regions = allRegionsAnalysis;
        return { instance_stored_volume_used };
    }
}
