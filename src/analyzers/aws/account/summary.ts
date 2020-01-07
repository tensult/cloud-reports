import { CheckAnalysisType, ICheckAnalysisResult, SeverityStatus } from "../../../types";
import { BaseAnalyzer } from "../../base";

export class AccountIdAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const accountId = params.id;
        if (!accountId) {
            return undefined;
        }
        const summary: ICheckAnalysisResult = { type: CheckAnalysisType.Informational };
        summary.what = "Cloud reports scans and reports issues about the AWS Account";
        summary.why = `AWS cloud offers several security features but it also
        enforces a shared responsibility so we need to keep reviewing the
         account and fixing the issues.`;
        summary.recommendation = "Recommended to run the Cloud reports at least once in month.";
        summary.regions = {
            global: [{
                action: "Run Cloud Reports on regular basis",
                message: `${new Date().toString()}`,
                resourceSummary: {
                    name: "AccountId",
                    value: accountId,
                },
                severity: SeverityStatus.Info,
            }],
        };
        return { summary };
    }
}
