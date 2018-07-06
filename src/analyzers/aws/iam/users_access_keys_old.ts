import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType } from '../../../types';

const millsIn180Days = 180 * 24 * 60 * 60 * 1000;
export class UsersAccessKeysOldAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const credentials: any[] = params.credentials;
        const userCredentials = credentials.filter((credential) => {
            return credential.user !== '<root_account>' &&
                (credential.access_key_1_active === 'true' || credential.access_key_2_active === 'true');
        });
        
        const users_access_keys_old: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        users_access_keys_old.what = "Are user access keys are too old?";
        users_access_keys_old.why = "It is important to rotate access keys regularly as it will reduce improper use"
        users_access_keys_old.recommendation = "Recommended to rotate user access keys regularly";
        const allUsersAccessKeysAnalysis: ResourceAnalysisResult[] = []; 
        userCredentials.forEach((credential) => {
            let user_access_keys_old: ResourceAnalysisResult = {};
            user_access_keys_old.resource = credential;
            user_access_keys_old.resourceSummary = {
                 name: 'User',
                 value: user_access_keys_old.resource.user
            }
            let access_key_1_old = this.isUserAccessKeysOld(credential.access_key_1_last_rotated);
            let access_key_2_old = this.isUserAccessKeysOld(credential.access_key_2_last_rotated);

            if (credential.access_key_1_active === 'true') {
                let user_access_key1_old: ResourceAnalysisResult = Object.assign({}, user_access_keys_old);
                if (access_key_1_old) {
                    user_access_key1_old.severity = SeverityStatus.Failure;
                    user_access_key1_old.message = "User access key 1 is not rotated from last 180 days";
                    user_access_key1_old.action = "Rotate user access key 1"
                } else {
                    user_access_key1_old.severity = SeverityStatus.Good;
                    user_access_key1_old.message = "User access key 1 is rotated within last 180 days";
                }
                allUsersAccessKeysAnalysis.push(user_access_key1_old);
            }

            if (credential.access_key_2_active === 'true') {
                let user_access_key2_old: ResourceAnalysisResult = Object.assign({}, user_access_keys_old);
                if (access_key_2_old) {
                    user_access_key2_old.severity = SeverityStatus.Failure;
                    user_access_key2_old.message = "User access key 2 is not rotated from last 180 days";
                    user_access_key2_old.action = "Rotate user access key 2"
                } else {
                    user_access_key2_old.severity = SeverityStatus.Good;
                    user_access_key2_old.message = "User access key 2 is rotated within last 180 days";
                }
                allUsersAccessKeysAnalysis.push(user_access_key2_old);
            }

        });
        users_access_keys_old.regions = {global : allUsersAccessKeysAnalysis};
        return { users_access_keys_old }
    }

    private isUserAccessKeysOld(access_key_last_rotated: string) {
        if (access_key_last_rotated === 'N/A') {
            return false;
        }

        const access_key_last_rotated_time = new Date(access_key_last_rotated).getTime();
        return (access_key_last_rotated_time < Date.now() - millsIn180Days);
    }
}