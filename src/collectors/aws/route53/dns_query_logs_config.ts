import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";

export class DnsQueryLogsConfigCollector extends BaseCollector {
    collect(callback: (err?: Error, data?: any) => void) {
        return this.listAllQueryLogsConfigs();
    }

    private async listAllQueryLogsConfigs() {
        try {
            const route53 = this.getClient('Route53', 'us-east-1') as AWS.Route53;
            let fetchPending = true;
            let marker: string | undefined = undefined;
            let query_logs_config: AWS.Route53.QueryLoggingConfig[] = [];
            while (fetchPending) {
                let route53QueryLogsConfig: AWS.Route53.ListQueryLoggingConfigsResponse = await route53.listQueryLoggingConfigs({ NextToken: marker }).promise();
                query_logs_config = query_logs_config.concat(route53QueryLogsConfig.QueryLoggingConfigs);
                marker = route53QueryLogsConfig.NextToken;
                fetchPending = marker !== undefined;
            }
            return { query_logs_config };
        } catch (error) {
            console.error(error);
        }
    }
}