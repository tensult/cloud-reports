import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class CodeSizeAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const size40gb = 40 * 1000 * 1000;
        const size60gb = 60 * 1000 * 1000;
        const size70gb = 70 * 1000 * 1000;
        const allFunctions = params.functions;
        if (!allFunctions) {
            return undefined;
        }
        const code_size:
            ICheckAnalysisResult = { type: CheckAnalysisType.PerformanceEfficiency };
        code_size.what = "What is the code size your funtion has used?";
        code_size.why = `Lambda has threshold code size of 75gb, your code size cannot exceed the limit.`;
        code_size.recommendation = `Recommended to keep track of the size of the code been used.`;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allFunctions) {
            const regionFunctions = allFunctions[region];
            allRegionsAnalysis[region] = [];
            for (const fn of regionFunctions) {
                const code_size_Analysis: IResourceAnalysisResult = {};
                code_size_Analysis.resource = fn;
                const Function_Name = fn.FunctionName;
                let Code_Size = fn.CodeSize;
                const Size_Left = this.getCodeSizeLeft(Code_Size, size70gb);
                code_size_Analysis.resourceSummary = {
                    name: "CodeSize",
                    value: `${Function_Name} | ${Code_Size} | Code_Size left : ${Size_Left}`,
                };
                if (Code_Size <= size40gb) {
                    code_size_Analysis.severity = SeverityStatus.Good;
                    code_size_Analysis.message = "The file size been used is less than 40gb.Your file still has access to lot of memory.";
                } else if (Code_Size <= size60gb && Code_Size > size40gb) {
                    code_size_Analysis.severity = SeverityStatus.Warning;
                    code_size_Analysis.message = "Your file size has exceeded 40gb and is nearing the max limit of code size i.e. 75gb.";
                } else if (Code_Size > size60gb && Code_Size <= size70gb) {
                    code_size_Analysis.severity + SeverityStatus.Failure;
                    code_size_Analysis.message = "Please check for the code size as it has almost reached the threshold limit.";

                }
                allRegionsAnalysis[region].push(code_size_Analysis);
            }
        }
        code_size.regions = allRegionsAnalysis;
        return { code_size };
    }
    private getCodeSizeLeft(Code_Size, size70gb) {
        const sizeLeft = size70gb - Code_Size;
        return sizeLeft;
    }
}
