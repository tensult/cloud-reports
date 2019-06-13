import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class NodeVersionCheckAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allFunctions = params.functions;
        if (!allFunctions) {
            return undefined;
        }
        const node_version_check:
            ICheckAnalysisResult = { type: CheckAnalysisType.PerformanceEfficiency };
        node_version_check.what = "Is your function node updated?";
        node_version_check.why = `We need to regularly check the node version for the function as the older version will lose compatibility
        some features of the function you are using.`;
        node_version_check.recommendation = `Keep a regular check on node updates to use all the features efficiently.`;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allFunctions) {
            const regionFunctions = allFunctions[region];
            allRegionsAnalysis[region] = [];
            for (const fn of regionFunctions) {
                const nodeVersionAnalysis: IResourceAnalysisResult = {};
                nodeVersionAnalysis.resource = fn;
                if (fn.Runtime.indexOf("nodejs") != -1) {
                    const nodejs_V = fn.Runtime;
                    const version_validator = this.nodeVersionValidator(nodejs_V);
                    nodeVersionAnalysis.resourceSummary = {
                        name: "Node-Version",
                        value: fn.Runtime,
                    };
                    if (version_validator >= 8) {
                        nodeVersionAnalysis.severity = SeverityStatus.Good;
                        nodeVersionAnalysis.message = "The version is upto date";
                    } else {
                        nodeVersionAnalysis.severity = SeverityStatus.Warning;
                        nodeVersionAnalysis.message = "You need to update your node version.";
                        nodeVersionAnalysis.action = "Some feature won't be supported with the following verion. UPDATE IS REQUIRED!!!!";
                    }
                    allRegionsAnalysis[region].push(nodeVersionAnalysis);
                }
            }
        }
        node_version_check.regions = allRegionsAnalysis;
        return { node_version_check };
    }
    private nodeVersionValidator(nodejs_V) {
        const version = nodejs_V.split("nodejs")[1];
        return parseInt(version.split('.')[0]);
    }
}
