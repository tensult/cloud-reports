import { CheckAnalysisType, ICheckAnalysisResult, IResourceAnalysisResult, SeverityStatus } from "../../../types";
import { BaseAnalyzer } from "../../base";

const millsIn60Days = 60 * 24 * 60 * 60 * 1000;
export class UsersAccessKeysUnusedAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const credentials: any[] = params.credentials;
        if (!credentials) {
            return;
        }
        const userCredentials = credentials.filter((credential) => {
            return credential.user !== "<root_account>" &&
                (credential.access_key_1_active === "true" || credential.access_key_2_active === "true");
        });
        const users_access_keys_unused: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        users_access_keys_unused.what = "Are there any user access keys unused?";
        users_access_keys_unused.why = `It is important to delete unused or
        unneeded access keys as it reduces risk of misusing them`;
        users_access_keys_unused.recommendation = "Recommended to delete unused user access keys regularly";
        const allUsersAccessKeysAnalysis: IResourceAnalysisResult[] = [];
        userCredentials.forEach((credential) => {
            const user_access_keys_unused: IResourceAnalysisResult = {};
            user_access_keys_unused.resource = credential;
            user_access_keys_unused.resourceSummary = {
                name: "User",
                value: user_access_keys_unused.resource.user,
            };
            const access_key_1_used = this.isUserAccessKeysActivelyUsed(credential.access_key_1_last_used_date);
            const access_key_2_used = this.isUserAccessKeysActivelyUsed(credential.access_key_2_last_used_date);

            if (credential.access_key_1_active === "true") {
                const user_access_key1_unused: IResourceAnalysisResult = Object.assign({}, user_access_keys_unused);
                if (access_key_1_used) {
                    user_access_key1_unused.severity = SeverityStatus.Good;
                    user_access_key1_unused.message = "User access key 1 is actively used";
                } else {
                    user_access_key1_unused.severity = SeverityStatus.Failure;
                    user_access_key1_unused.message = "User access key 1 is unused";
                    user_access_key1_unused.action = "Delete unused user access key 1";
                }
                allUsersAccessKeysAnalysis.push(user_access_key1_unused);
            }

            if (credential.access_key_2_active === "true") {
                const user_access_key2_unused: IResourceAnalysisResult = Object.assign({}, user_access_keys_unused);
                if (access_key_2_used) {
                    user_access_key2_unused.severity = SeverityStatus.Good;
                    user_access_key2_unused.message = "User access key 2 is actively used";
                } else {
                    user_access_key2_unused.severity = SeverityStatus.Failure;
                    user_access_key2_unused.message = "User access key 2 is unused";
                    user_access_key2_unused.action = "Delete unused user access key 2";
                }
                allUsersAccessKeysAnalysis.push(user_access_key2_unused);
            }
        });

        users_access_keys_unused.regions = { global: allUsersAccessKeysAnalysis };
        return { users_access_keys_unused };
    }

    private isUserAccessKeysActivelyUsed(access_key_last_used_date: string) {
        if (access_key_last_used_date === "N/A") {
            return false;
        }

        const last_used_date_time = new Date(access_key_last_used_date).getTime();
        return (last_used_date_time > Date.now() - millsIn60Days);
    }
}
