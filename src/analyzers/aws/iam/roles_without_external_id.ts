import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType } from '../../../types';

export class RolesWithoutExternalIDAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allRolesPolicies = this.getAssumeRolePolicyDocument(params.roles);
        const mainAccountID = this.getAccountID(params.roles[0].Arn);
        const permittedAccounts = this.getPermittedAccounts(allRolesPolicies);
        const cross_accounts_without_external_id: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        cross_accounts_without_external_id.what = 'Are there cross account roles without ExternalId?';
        cross_accounts_without_external_id.why = 'It is important to associate ExternalId for cross account role access';
        cross_accounts_without_external_id.recommendation = "Recommended to use ExternalId for roles which give access to third party accounts"
        const analysis: ResourceAnalysisResult[] = [];

        permittedAccounts.forEach((roleAccountsObject) => {
            roleAccountsObject.Accounts.forEach((account) => {
                const crossAccountAnalysis: ResourceAnalysisResult = {
                    resourceSummary: {
                        name: "Roles",
                        value: roleAccountsObject['Role']
                    }
                }
                if (account.AccountID !== mainAccountID) {
                    if (account.AccountID && account.ExternalID) {
                        crossAccountAnalysis.severity = SeverityStatus.Good;
                        crossAccountAnalysis.message = `Account ${account.AccountID} has ExternalId`;
                    }
                    else {
                        crossAccountAnalysis.severity = SeverityStatus.Failure;
                        crossAccountAnalysis.action = 'Add an ExternalId'
                        crossAccountAnalysis.message = `Account ${account.AccountID} does not have ExternalId`;
                    }
                    analysis.push(crossAccountAnalysis);
                }
            });
        });
        cross_accounts_without_external_id.regions = { global: analysis };
        return { cross_accounts_without_external_id };
    };

    private getAssumeRolePolicyDocument(roles: any[]) {
        if(!roles) {
            return [];
        }
        return roles.map((role) => {
            let rolePolicies: any = {};
            rolePolicies.Role = role.RoleName;
            rolePolicies.AssumeRolePolicyDocument = role.AssumeRolePolicyDocument;
            return rolePolicies
        });
    };

    private getPermittedAccounts(allPolicies: any[]) {
        if(!allPolicies) {
            return [];
        }
        return allPolicies.map((eachPolicy) => {
            return this.getRoleAccountsObject(eachPolicy.Role, eachPolicy.AssumeRolePolicyDocument.Statement);
        });
    };

    private getRoleAccountsObject(role: string, Statements: any[]) {
        let roleAccountsObject: any = {};
        roleAccountsObject.Role = role;
        roleAccountsObject.Accounts = Statements.filter((statement) => {
            return statement.Principal.AWS;
        }).map((statement) => {
            let accountDetails: any = {};
            accountDetails.AccountID = this.getAccountID(statement.Principal.AWS);
            if (statement.Condition && statement.Condition.StringEquals) {
                accountDetails.ExternalID = statement.Condition.StringEquals['sts:ExternalId'];
            }
            return accountDetails;
        })
        return roleAccountsObject;
    };

    private getAccountID(arn: string) {
        if (arn) {
            return arn.split(':')[4];
        }
    }
}

