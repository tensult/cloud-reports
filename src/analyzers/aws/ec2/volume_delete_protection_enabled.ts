import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class EC2VolumeDeleteProtectionOnTerminationAnalyzer extends BaseAnalyzer {
    public  checks_what : string = "Are there any instances without deletion protection for volumes?";
    public  checks_why : string = `Instances can be accidentally terminated and data can be
    lost when they are without deletion protection for volumes`;
    public checks_recommendation : string = `Recommended to enable deletion
        protection for volumes attached to all production critical instances`;
    public checks_name : string = "Instance-Volume";
    public analyze(params: any, fullReport?: any): any {
        const allTerminationProtectionStatuses = params.termination_protection;
        const allInstances = params.instances;
        if (!allTerminationProtectionStatuses || !allInstances) {
            return undefined;
        }
        const volume_delete_protection_enabled: ICheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        volume_delete_protection_enabled.what = this.checks_what;
        volume_delete_protection_enabled.why = this.checks_why;
        volume_delete_protection_enabled.recommendation = this.checks_recommendation;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allInstances) {
            const regionInstances = allInstances[region];
            allRegionsAnalysis[region] = [];
            for (const instance of regionInstances) {
                if (!instance.BlockDeviceMappings || !instance.BlockDeviceMappings.length) {
                    continue;
                }
                for (const volume of instance.BlockDeviceMappings) {
                    const instanceAnalysis: IResourceAnalysisResult = {};
                    instanceAnalysis.resource = {
                        instanceId: instance.InstanceId,
                        instanceName: ResourceUtil.getNameByTags(instance),
                        volume,
                    };
                    instanceAnalysis.resourceSummary = {
                        name: this.checks_name,
                        value: `${instanceAnalysis.resource.instanceName} |
                        ${instance.InstanceId} - ${volume.DeviceName}`,
                    };
                    if (!volume.Ebs.DeleteOnTermination) {
                        instanceAnalysis.severity = SeverityStatus.Good;
                        instanceAnalysis.message = "Already enabled";
                    } else {
                        instanceAnalysis.severity = SeverityStatus.Warning;
                        instanceAnalysis.message = "Not enabled";
                        instanceAnalysis.action = "Enable deletion protection";
                    }
                    allRegionsAnalysis[region].push(instanceAnalysis);
                }
            }
        }
        volume_delete_protection_enabled.regions = allRegionsAnalysis;
        return { volume_delete_protection_enabled };
    }
}
