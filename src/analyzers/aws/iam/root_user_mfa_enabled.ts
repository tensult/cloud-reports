import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class RootUserMfaEnabledAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const credentials: any[] = params.credentials;
        if (!credentials) {
            return;
        }
        const rootUserIndex = credentials.findIndex((credential) => {
            return credential.user === "<root_>";
        });
        if (rootUserIndex === -1) {
            return;
        }
        const root_user_mfa_enabled: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        root_user_mfa_enabled.what = "Is MFA enabled root user?";
        root_user_mfa_enabled.why = `Root user should always use MFA when they login via AWS console as access
        can't be restricted so damage caused by leakage will be determental`;
        root_user_mfa_enabled.recommendation = "Recommended to enable MFA for root user";
        const analysis: IResourceAnalysisResult = {};
        analysis.resource = credentials[rootUserIndex];
        analysis.resourceSummary = {
            name: "User",
            value: analysis.resource.user,
        };

        if (credentials[rootUserIndex].mfa_active === "true") {
            analysis.severity = SeverityStatus.Good;
            analysis.message = "Root user is MFA enabled";
        } else {
            analysis.severity = SeverityStatus.Failure;
            analysis.message = "Root  is not MFA enabled";
            analysis.action = "Enable MFA for the root user";
        }
        root_user_mfa_enabled.regions = { global: [analysis] };
        return { root_user_mfa_enabled };
    }
}
