import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class RootUserAccessKeysActiveAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const credentials: any[] = params.credentials;
        if (!credentials) {
            return;
        }
        const rootUserIndex = credentials.findIndex((credential) => {
            return credential.user === "<root_account>";
        });
        if (rootUserIndex === -1) {
            return;
        }
        const root_user_access_keys_active: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        root_user_access_keys_active.what = "Are there any root user access keys active?";
        root_user_access_keys_active.why = `Root user access keys are unrestrictable hence shouldn't be
        used as damage will be determental if they gets leaked`;
        root_user_access_keys_active.recommendation = "Recommended to delete and never user root user access keys";
        const analysis: IResourceAnalysisResult = {};
        analysis.resource = credentials[rootUserIndex];
        analysis.resourceSummary = {
            name: "User",
            value: analysis.resource.user,
        };

        if (credentials[rootUserIndex].access_key_1_active ===
            "false" && credentials[rootUserIndex].access_key_2_active === "false") {
            analysis.severity = SeverityStatus.Good;
            analysis.message = "Root user access keys are not active";
        } else {
            analysis.severity = SeverityStatus.Failure;
            analysis.message = "Root user access keys are active";
            analysis.action = `Delete the root user access keys instead use IAM
            user access keys for programmatic access`;
        }
        root_user_access_keys_active.regions = { global: [analysis] };
        return { root_user_access_keys_active };
    }
}
