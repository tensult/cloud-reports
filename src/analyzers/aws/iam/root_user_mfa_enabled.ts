import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class RootUserMfaEnabledAnalyzer extends BaseAnalyzer {
    public  checks_what : string = "Is MFA enabled root user?";
    public  checks_why : string = `Root user should always use MFA when they login via AWS console as access
    can't be restricted so damage caused by leakage will be determental`;
    public checks_recommendation : string = "Recommended to enable MFA for root user";
    public checks_name : string = "User";
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
        root_user_mfa_enabled.what = this.checks_what;
        root_user_mfa_enabled.why = this.checks_why;
        root_user_mfa_enabled.recommendation = this.checks_recommendation;
        const analysis: IResourceAnalysisResult = {};
        analysis.resource = credentials[rootUserIndex];
        analysis.resourceSummary = {
            name: this.checks_name,
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
