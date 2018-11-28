import { CheckAnalysisType, ICheckAnalysisResult, IResourceAnalysisResult, SeverityStatus } from "../../../types";
import { BaseAnalyzer } from "../../base";

const allAuthenticatedUsersUri = "http://acs.amazonaws.com/groups/global/AuthenticatedUsers";
const allUsersUri = "http://acs.amazonaws.com/groups/global/AllUsers";

export class BucketAccessAnalyzer extends BaseAnalyzer {

    public analyze(params: any): any {
        const allBucketAcls = params.bucket_acls;
        if (!allBucketAcls || allBucketAcls.length === 0) {
            return undefined;
        }
        const bucket_access: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        bucket_access.what = "Are there any buckets with open access to everyone?";
        bucket_access.why = "Generally buckets shouldn't allow open access unless there is good usecase";
        bucket_access.recommendation = "Recommended to keep bucket acl as restrictive as possible for the business";
        const allBucketsAnalysis: IResourceAnalysisResult[] = [];

        for (const bucketName in allBucketAcls) {
            const bucketAcl = allBucketAcls[bucketName];
            const bucketAnalysis: IResourceAnalysisResult = {};
            bucketAnalysis.resource = { bucketName, bucketAcl };
            bucketAnalysis.resourceSummary = { name: "Bucket", value: bucketName };
            const grants = bucketAcl.Grants;
            const authenticateUsersGrant = this.getAnalysisForGroupGrants(grants, allAuthenticatedUsersUri);
            if (authenticateUsersGrant) {
                const bucket_acl_analysis: IResourceAnalysisResult = Object.assign({}, bucketAnalysis);
                bucket_acl_analysis.severity = SeverityStatus.Warning;
                bucket_acl_analysis.message = `All authenticated users of any AWS account have
                ${this.getPermissionMessage(authenticateUsersGrant.Permission)} access on the bucket`;
                bucket_acl_analysis.action = "Disable open access to any authenticated user";
                allBucketsAnalysis.push(bucket_acl_analysis);
            }

            const allUsersGrant = this.getAnalysisForGroupGrants(grants, allUsersUri);
            if (allUsersGrant) {
                const bucket_acl_analysis: IResourceAnalysisResult = Object.assign({}, bucketAnalysis);
                bucket_acl_analysis.severity = SeverityStatus.Warning;
                bucket_acl_analysis.message = `All users have
                ${this.getPermissionMessage(allUsersGrant.Permission)} access on the bucket`;
                bucket_acl_analysis.action = "Disable open access to any user";
                allBucketsAnalysis.push(bucket_acl_analysis);
            }
        }
        bucket_access.regions = { global: allBucketsAnalysis };
        return { bucket_access };
    }

    private getAnalysisForGroupGrants(grants: any[], groupUri: string) {
        const groupGrants = grants.filter((grant) => {
            return grant.Grantee.URI === groupUri;
        });
        if (groupGrants.length) {
            return groupGrants[0];
        }
        return undefined;
    }

    private getPermissionMessage(permission: string) {
        switch (permission) {
            case "READ": return "read";
            case "READ_ACP": return "read permissions";
            case "WRITE": return "write";
            case "WRITE_ACP": return "write permissions";
            case "FULL_CONTROL": return "full";
        }
    }
}
