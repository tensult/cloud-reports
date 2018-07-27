import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, SeverityStatus, CheckAnalysisType } from '../../../types';

export class AccountIdAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const accountId = params.id;
        if (!accountId) {
            return undefined;
        }
        const summary: CheckAnalysisResult = { type: CheckAnalysisType.Informational };
        summary.what = "Cloud reports scans and reports issues about the AWS Account";
        summary.why = "AWS cloud offers several security features but it also enforces a shared responsibility so we need to keep reviewing the account and fixing the issues."
        summary.recommendation = "Recommended to run the Cloud reports at least once in month.";
        summary.regions = {
            global: [{
                severity: SeverityStatus.Info,
                message: `${new Date().toString()}`,
                action: "Run Cloud Reports on regular basis",
                resourceSummary: {
                    name: 'AccountId',
                    value: accountId
                }
            }]
        };
        return { summary };
    }
}