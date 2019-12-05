import { CheckAnalysisType, ICheckAnalysisResult, SeverityStatus } from "../../../types";
import { BaseAnalyzer } from "../../base";

export class AccountIdAnalyzer extends BaseAnalyzer {
    public checks_what = "Cloud reports scans and reports issues about the AWS Account";
    public checks_why = `AWS cloud offers several security features but it also
    enforces a shared responsibility so we need to keep reviewing the
     account and fixing the issues.`;
     public checks_recommendation = "Recommended to run the Cloud reports at least once in month.";
     public checks_name= "AccountId";
    public analyze(params: any, fullReport?: any): any {
        const accountId = params.id;
        if (!accountId) {
            return undefined;
        }
        const summary: ICheckAnalysisResult = { type: CheckAnalysisType.Informational };
        summary.what = this.checks_what;
        summary.why = this.checks_why;
        summary.recommendation = this.checks_recommendation;
        summary.regions = {
            global: [{
                action: "Run Cloud Reports on regular basis" ,
                message: `${new Date().toString()}`,
                resourceSummary: {
                    name: this.checks_name,
                    value: accountId,
                },
                severity: SeverityStatus.Info,
            }],
        };
        return { summary };
    }
}
