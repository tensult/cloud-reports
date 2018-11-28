import { CheckAnalysisType, ICheckAnalysisResult, IResourceAnalysisResult, SeverityStatus } from "../../../types";
import { BaseAnalyzer } from "../../base";

const millsIn180Days = 180 * 24 * 60 * 60 * 1000;
export class UsersAccessKeysOldAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const credentials: any[] = params.credentials;
        if (!credentials) {
            return;
        }
        const userCredentials = credentials.filter((credential) => {
            return credential.user !== "<root_account>" &&
                (credential.access_key_1_active === "true" || credential.access_key_2_active === "true");
        });

        const users_access_keys_old: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        users_access_keys_old.what = "Are user access keys are too old?";
        users_access_keys_old.why = "It is important to rotate access keys regularly as it will reduce improper use";
        users_access_keys_old.recommendation = "Recommended to rotate user access keys regularly";
        const allUsersAccessKeysAnalysis: IResourceAnalysisResult[] = [];
        userCredentials.forEach((credential) => {
            const user_access_keys_old: IResourceAnalysisResult = {};
            user_access_keys_old.resource = credential;
            user_access_keys_old.resourceSummary = {
                name: "User",
                value: user_access_keys_old.resource.user,
            };
            const access_key_1_old = this.isUserAccessKeysOld(credential.access_key_1_last_rotated);
            const access_key_2_old = this.isUserAccessKeysOld(credential.access_key_2_last_rotated);

            if (credential.access_key_1_active === "true") {
                const user_access_key1_old: IResourceAnalysisResult = Object.assign({}, user_access_keys_old);
                if (access_key_1_old) {
                    user_access_key1_old.severity = SeverityStatus.Failure;
                    user_access_key1_old.message = "User access key 1 is not rotated from last 180 days";
                    user_access_key1_old.action = "Rotate user access key 1";
                } else {
                    user_access_key1_old.severity = SeverityStatus.Good;
                    user_access_key1_old.message = "User access key 1 is rotated within last 180 days";
                }
                allUsersAccessKeysAnalysis.push(user_access_key1_old);
            }

            if (credential.access_key_2_active === "true") {
                const user_access_key2_old: IResourceAnalysisResult = Object.assign({}, user_access_keys_old);
                if (access_key_2_old) {
                    user_access_key2_old.severity = SeverityStatus.Failure;
                    user_access_key2_old.message = "User access key 2 is not rotated from last 180 days";
                    user_access_key2_old.action = "Rotate user access key 2";
                } else {
                    user_access_key2_old.severity = SeverityStatus.Good;
                    user_access_key2_old.message = "User access key 2 is rotated within last 180 days";
                }
                allUsersAccessKeysAnalysis.push(user_access_key2_old);
            }

        });
        users_access_keys_old.regions = { global: allUsersAccessKeysAnalysis };
        return { users_access_keys_old };
    }

    private isUserAccessKeysOld(access_key_last_rotated: string) {
        if (access_key_last_rotated === "N/A") {
            return false;
        }

        const access_key_last_rotated_time = new Date(access_key_last_rotated).getTime();
        return (access_key_last_rotated_time < Date.now() - millsIn180Days);
    }
}
