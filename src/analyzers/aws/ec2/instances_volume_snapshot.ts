import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";
import * as moment from 'moment';

export class InstanceVolumeSnapshotAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        if (!allInstances) {
            return undefined;
        }
        const instances_volume_snapshot: ICheckAnalysisResult = { type: CheckAnalysisType.Informational }
        instances_volume_snapshot.what = "Are Snapshots being taken for EBS volumes?";
        instances_volume_snapshot.why = `If we take regular snapshots of EBS volumes
        then it prevents data loss incase of volume failure or accidental deletes`;
        instances_volume_snapshot.recommendation = "Recommended to take regular snapshots for all in-use volumes";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allInstances) {
            const regionInstances = allInstances[region];
            allRegionsAnalysis[region] = [];
            for (const instance of regionInstances) {
                for (const blockDeviceMap of instance.BlockDeviceMappings) {
                    const instanceAnalysis: IResourceAnalysisResult = {};
                    instanceAnalysis.resource = instance;
                    instanceAnalysis.resourceSummary = {
                        name: "Instance",
                        value: `${ResourceUtil.getNameByTags(instance)} | ${instance.InstanceId} | ${blockDeviceMap.Ebs.VolumeId}`,
                    };
                    if (blockDeviceMap.Ebs.Snapshots.length === 0) {
                        instanceAnalysis.severity = SeverityStatus.Failure;
                        instanceAnalysis.message = "EC2 instance volume does not have any snapshot taken";
                        instanceAnalysis.action = "Take snapshot";
                    }
                    if (blockDeviceMap.Ebs.Snapshots.length > 0) {
                        const d = new Date(blockDeviceMap.Ebs.Snapshots[0].StartTime);
                        const now = new Date();
                        const start = moment(this.getDate(d));
                        const end = moment(this.getDate(now));
                        const diff = end.diff(start, "days");
                        if (diff <= 1) {
                            instanceAnalysis.severity = SeverityStatus.Good;
                            instanceAnalysis.message = `Last snapshot taken on ${d.getUTCDate()}-${d.getUTCMonth() + 1}-${d.getUTCFullYear()} (UTC time)`;
                        }
                        if (diff > 1) {
                            instanceAnalysis.severity = SeverityStatus.Warning;
                            instanceAnalysis.message = `Last snapshot taken on ${d.getUTCDate()}-${d.getUTCMonth() + 1}-${d.getUTCFullYear()} (UTC time)`;
                        }
                    }
                    allRegionsAnalysis[region].push(instanceAnalysis);
                }
            }
        }
        instances_volume_snapshot.regions = allRegionsAnalysis;
        return { instances_volume_snapshot };
    }

    private getDate(dateObj: any) {
        const d = dateObj.getUTCDate().toString().length === 1 ? '0' + dateObj.getUTCDate().toString() : dateObj.getUTCDate().toString();
        const m = (dateObj.getUTCMonth() + 1).toString().length === 1 ? '0' + (dateObj.getUTCMonth() + 1).toString() : (dateObj.getUTCMonth() + 1).toString();
        const y = dateObj.getUTCFullYear();
        return `${y}-${m}-${d}`;
    }

}
