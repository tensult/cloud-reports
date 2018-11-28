import { CheckAnalysisType, ICheckAnalysisResult, IResourceAnalysisResult, SeverityStatus } from "../../../types";
import { BaseAnalyzer } from "../../base";

const adminPolicyArn = "arn:aws:iam::aws:policy/AdministratorAccess";
export class AdminCountAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const adminGroupNames = this.getAdminGroups(params.group_policies);
        let adminUsers: string[] = [];
        adminUsers = adminUsers.concat(this.getAdminsFromGroups(params.group_users, adminGroupNames));
        adminUsers = adminUsers.concat(this.getAdminsFromUsers(params.user_policies));
        const admin_count: ICheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        admin_count.what = "Are there too many admins for the account?";
        admin_count.why = `It is hard to manage security goals
        when there too many admins as chances of mistakes increases`;
        admin_count.recommendation = "Recommended to have 2-3 admins per account";
        const analysis: IResourceAnalysisResult = {};
        analysis.resource = { adminUsers };
        analysis.resourceSummary = {
            name: "AdminUsers", value: adminUsers.length ? adminUsers.join(", ") : "None",
        };
        analysis.title = "Number of admins in the account";
        if (adminUsers.length > 3) {
            analysis.severity = SeverityStatus.Warning;
            analysis.message = "Account has more than 3 admins";
            analysis.action = "Keep only 3 admins";
        } else if (adminUsers.length === 0) {
            analysis.severity = SeverityStatus.Failure;
            analysis.message = "Account has no admins";
            analysis.action = "You should create at least one admin";
        } else {
            analysis.severity = SeverityStatus.Good;
            analysis.message = `Account has ${adminUsers.length} admins`;
        }
        admin_count.regions = { global: [analysis] };
        return { admin_count };
    }

    private getAdminGroups(group_policies: any) {
        const adminGroups: string[] = [];
        for (const group_name in group_policies) {
            const adminPolicies = group_policies[group_name].filter((group_policy) => {
                return group_policy.PolicyArn === adminPolicyArn;
            });
            if (adminPolicies && adminPolicies.length) {
                adminGroups.push(group_name);
            }
        }
        return adminGroups;
    }

    private getAdminsFromGroups(group_users: any, group_names: string[]) {
        let adminUsers: string[] = [];
        for (const group_name of group_names) {
            adminUsers = adminUsers.concat(group_users[group_name].map((user) => {
                return user.UserName;
            }));
        }
        return adminUsers;
    }

    private getAdminsFromUsers(user_policies: any) {
        const adminUsers: string[] = [];
        for (const user_name in user_policies) {
            const adminPolicies = user_policies[user_name].filter((user_policy) => {
                return user_policy.PolicyArn === adminPolicyArn;
            });
            if (adminPolicies && adminPolicies.length) {
                adminUsers.push(user_name);
            }
        }
        return adminUsers;
    }
}
