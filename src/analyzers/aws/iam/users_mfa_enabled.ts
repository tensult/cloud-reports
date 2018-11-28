import { CheckAnalysisType, ICheckAnalysisResult, IResourceAnalysisResult, SeverityStatus } from "../../../types";
import { BaseAnalyzer } from "../../base";

export class UserAccountsMfaEnabledAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const credentials: any[] = params.credentials;
        if (!credentials) {
            return;
        }
        const userCredentials = credentials.filter((credential) => {
            return credential.user !== "<root_account>";
        });
        const user_accounts_mfa_enabled: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        user_accounts_mfa_enabled.what = "Are there any user access keys unused?";
        user_accounts_mfa_enabled.why = `It is important to delete unused or unneeded
        access keys as it reduces risk of misusing them`;
        user_accounts_mfa_enabled.recommendation = "Recommended to delete unused user access keys regularly";
        const analysis: IResourceAnalysisResult[] = userCredentials.map((credential) => {
            const user_account_mfa_enabled: IResourceAnalysisResult = {};
            user_account_mfa_enabled.resource = credential;
            user_account_mfa_enabled.resourceSummary = {
                name: "User",
                value: user_account_mfa_enabled.resource.user,
            };
            if (credential.mfa_active === "true") {
                user_account_mfa_enabled.severity = SeverityStatus.Good;
                user_account_mfa_enabled.message = "User account is MFA enabled";
            } else {
                user_account_mfa_enabled.severity = SeverityStatus.Failure;
                user_account_mfa_enabled.message = "User account is not MFA enabled";
                user_account_mfa_enabled.action = "Enable MFA for the user";
            }
            return user_account_mfa_enabled;
        });
        user_accounts_mfa_enabled.regions = { global: analysis };
        return { user_accounts_mfa_enabled };
    }
}
