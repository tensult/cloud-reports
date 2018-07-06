import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType } from '../../../types';

export class RolesWithoutExternalIDAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allRolesPolicies = this.getAssumeRolePolicyDocument(params.roles);
        const mainAccountID = this.getAccountID(params.roles[0].Arn);
        const permittedAccounts = this.getPermittedAccounts(allRolesPolicies);
        const cross_accounts_without_external_id: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        cross_accounts_without_external_id.what = 'Are there accounts without ExternalId?';
        cross_accounts_without_external_id.why = 'It is important to associate ExternalId for cross account role access';
        cross_accounts_without_external_id.recommendation = "Recommended to use ExternalId for third party accounts"
        const analysis: ResourceAnalysisResult[] = [];

        permittedAccounts.forEach((roleAccountsObject) => {
            roleAccountsObject['Accounts'].forEach((account) => {
                const crossaccountAnalysis: ResourceAnalysisResult = {
                    resourceSummary: {
                        name: "Roles",
                        value: roleAccountsObject['Role']
                    }
                }
                if (account.AccountID !== mainAccountID) {
                    if (account.AccountID && account.ExternalID) {
                        crossaccountAnalysis.severity = SeverityStatus.Good;
                        crossaccountAnalysis.message = `Account ${account.AccountID} has ExternalId`;
                    }
                    else {
                        crossaccountAnalysis.severity = SeverityStatus.Failure;
                        crossaccountAnalysis.action = 'Add an ExternalId'
                        crossaccountAnalysis.message = `Account ${account.AccountID} does not have ExternalId`;
                    }
                    analysis.push(crossaccountAnalysis);
                }
            });
        });
        cross_accounts_without_external_id.regions = { global: analysis };
        return { cross_accounts_without_external_id };
    };

    private getAssumeRolePolicyDocument(roles: any[]) {
        return roles.map((role) => {
            let rolePolicies: object = {};
            rolePolicies['Role'] = role.RoleName;
            rolePolicies['AssumeRolePolicyDocument'] = role.AssumeRolePolicyDocument;
            return rolePolicies
        });
    };

    private getPermittedAccounts(allPolicies: any[]) {
        return allPolicies.map((eachPolicy) => {
            return this.getRoleAccountsObject(eachPolicy.Role, eachPolicy.AssumeRolePolicyDocument.Statement);
        });
    };

    private getRoleAccountsObject(role: string, Statements: any[]) {
        let roleAccountsObject: object = {};
        roleAccountsObject['Role'] = role;
        roleAccountsObject['Accounts'] = Statements.map((eachStatement) => {
            let accountDetails: object = {};
            accountDetails['AccountID'] = this.getAccountID(eachStatement.Principal.AWS);
            if (eachStatement.Condition && eachStatement.Condition.StringEquals) {
                accountDetails['ExternalID'] = eachStatement.Condition.StringEquals['sts:ExternalId'];
            }
            return accountDetails;
        });
        return roleAccountsObject;
    };

    private getAccountID(arn: string) {
        if (arn) {
            return arn.split(':')[4];
        }
    }
}

