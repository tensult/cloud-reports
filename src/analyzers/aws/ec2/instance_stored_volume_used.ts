import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class InstanceStoreVolumesAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        if (!allInstances) {
            return undefined;
        }
        const instance_stored_volume_used: ICheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        instance_stored_volume_used.what = "Are there any EC2 instances with instance stored volumes";
        instance_stored_volume_used.why = `Instance store volumes will lose the data
        in case the instance is failed or terminated`;
        instance_stored_volume_used.recommendation = `Recommended to use EBS backed volumes
        as they can help us to recover data when instance has failed`;
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
                    name: "Instance",
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
