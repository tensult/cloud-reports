import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType } from '../../../types';

export class CloudTrailsBucketMFADeleteAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport: any): any {
        const allBucketVersionings = fullReport['aws.s3'].bucket_versioning;
        const allCloudTrails = params.cloud_trails;
        if (!allBucketVersionings || !allCloudTrails) {
            return undefined;
        }
        const cloud_trails_bucket_deletes_mfa_enabled: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        cloud_trails_bucket_deletes_mfa_enabled.what = "Is deleting cloud trails protected by MFA?";
        cloud_trails_bucket_deletes_mfa_enabled.why = "Cloud trails deletes should be MFA enabled so that attacker won't able to delete them"
        cloud_trails_bucket_deletes_mfa_enabled.recommendation = "Recommended to enable MFA for deleting Cloud Trails";
        const allBucketsAnalysis: ResourceAnalysisResult[] = [];
        const cloudTrailBuckets = this.getCloudTrailBuckets(allCloudTrails);
        for (let bucketName of cloudTrailBuckets) {
            let bucketVersioning = allBucketVersionings[bucketName];
            let bucketAnalysis: ResourceAnalysisResult = {};
            bucketAnalysis.resource = { bucketName, bucketVersioning };
            bucketAnalysis.resourceSummary = { name: 'Bucket', value: bucketName };
            if (bucketVersioning && bucketVersioning.MFADelete === 'Enabled') {
                bucketAnalysis.severity = SeverityStatus.Good;
                bucketAnalysis.message = 'Deletes are MFA enabled';
            } else {
                bucketAnalysis.severity = SeverityStatus.Failure;
                bucketAnalysis.message = 'Deletes are not MFA enabled';
                bucketAnalysis.action = 'Enable MFADelete'
            }

            allBucketsAnalysis.push(bucketAnalysis);
        }
        cloud_trails_bucket_deletes_mfa_enabled.regions = { global: allBucketsAnalysis };
        return { cloud_trails_bucket_deletes_mfa_enabled };
    }

    getCloudTrailBuckets(cloudTrails) {
        const s3Buckets: any = {};
        for (let region in cloudTrails) {
            cloudTrails[region].forEach(trail => {
                s3Buckets[trail.S3BucketName] = 1;
            });
        }
        return Object.keys(s3Buckets);
    }
}