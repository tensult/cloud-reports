import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";
import { CommonUtil } from "../../../utils";

export class RuntimeVersionCheckAnalyzer extends BaseAnalyzer {

    private static deprecatedRuntimes: IDictionary<Date> = {
        'nodejs': new Date("2016-10-31"),
        'nodejs4.3': new Date("2018-04-30"),
        'nodejs4.3-edge': new Date("2018-04-30"),
        'nodejs6.10': new Date("2019-04-30"),
        'dotnetcore2.0': new Date("2019-04-30"),
        'dotnetcore1.0': new Date("2019-06-27"),
        'nodejs8.10': new Date("2019-12-31"),
    }

    public analyze(params: any, fullReport?: any): any {
        const allFunctions = params.functions;
        if (!allFunctions) {
            return undefined;
        }
        const runtime_version_check:
            ICheckAnalysisResult = { type: CheckAnalysisType.PerformanceEfficiency };
        runtime_version_check.what = "Is your function runtime up to date?";
        runtime_version_check.why = `We need to regularly check the Lambda function runtime for the function as the some of the older versions may be deprecated`;
        runtime_version_check.recommendation = `Update the function runtime with latest version so that you are up to date with new feature support.`;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allFunctions) {
            const regionFunctions = allFunctions[region];
            allRegionsAnalysis[region] = [];
            for (const fn of regionFunctions) {
                const runtimeVersionAnalysis: IResourceAnalysisResult = {};
                runtimeVersionAnalysis.resource = fn;
                runtimeVersionAnalysis.resourceSummary = {
                    name: "Lambda-Runtime",
                    value: fn.Runtime,
                };
                if (!RuntimeVersionCheckAnalyzer.deprecatedRuntimes[fn.Runtime]) {
                    runtimeVersionAnalysis.severity = SeverityStatus.Good;
                    runtimeVersionAnalysis.message = "Runtime version is not deprecated";
                    runtimeVersionAnalysis.action = "All Good";
                } else {
                    let deprecationDate = RuntimeVersionCheckAnalyzer.deprecatedRuntimes[fn.Runtime];
                    let deprecationDays = CommonUtil.daysFrom(deprecationDate);
                    if (deprecationDays < 0) {
                        runtimeVersionAnalysis.message = `Runtime version is going to be deprecated in ${Math.abs(deprecationDays)} day`;
                        runtimeVersionAnalysis.action = "Update the function runtime with latest version so that you are up to date with new feature support.";
                    } else {
                        runtimeVersionAnalysis.message = "Runtime version is deprecated on " + deprecationDate;
                    }

                    if (deprecationDays < -180) {
                        runtimeVersionAnalysis.severity = SeverityStatus.Info;
                        runtimeVersionAnalysis.message = "Runtime version is going to be deprecated on " + deprecationDate;
                    } else if (deprecationDays < -90) {
                        runtimeVersionAnalysis.severity = SeverityStatus.Warning;
                        runtimeVersionAnalysis.message = `Runtime version is going to be deprecated in ${Math.abs(deprecationDays)} day`;

                    } else {
                        runtimeVersionAnalysis.severity = SeverityStatus.Failure;
                    }
                }
                allRegionsAnalysis[region].push(runtimeVersionAnalysis);
            }
        }
        runtime_version_check.regions = allRegionsAnalysis;
        return { runtime_version_check };
    }

}
