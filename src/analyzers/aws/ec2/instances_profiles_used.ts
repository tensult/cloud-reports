import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class InstanceProfilesUsageAnalyzer extends BaseAnalyzer {
    public  checks_what : string = "Are there any EC2 instances without IAM Instance Profile?";
    public  checks_why : string = `We should use IAM Instance profile
    roles for granting EC2 instances access to other AWS resources`;
    public  checks_recommendation :string =`Recommended to assign IAM instance profile to
    EC2 instances instead of hard coding IAM credentials`;
    public  checks_name : string ="Instance";
    public analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        if (!allInstances) {
            return undefined;
        }
        const instance_profiles_used: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        instance_profiles_used.what = this.checks_what;
        instance_profiles_used.why = this.checks_why;
        instance_profiles_used.recommendation = this.checks_recommendation;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allInstances) {
            const regionInstances = allInstances[region];
            allRegionsAnalysis[region] = [];
            for (const instance of regionInstances) {
                const instanceAnalysis: IResourceAnalysisResult = {};
                instanceAnalysis.resource = instance;
                instanceAnalysis.resourceSummary = {
                    name: this.checks_name,
                    value: `${ResourceUtil.getNameByTags(instance)} | ${instance.InstanceId}`,
                };
                if (instance.IamInstanceProfile) {
                    instanceAnalysis.severity = SeverityStatus.Good;
                    instanceAnalysis.message = "IAM Instance profile is assigned";
                } else {
                    instanceAnalysis.severity = SeverityStatus.Info;
                    instanceAnalysis.message = "IAM Instance profile is not assigned";
                    instanceAnalysis.action = "Assign IAM Instance profile to the instance";
                }
                allRegionsAnalysis[region].push(instanceAnalysis);
            }
        }
        instance_profiles_used.regions = allRegionsAnalysis;
        return { instance_profiles_used };
    }
}