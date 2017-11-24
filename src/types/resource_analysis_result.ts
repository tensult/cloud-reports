import { Dictionary } from './dictionary'
import { SeverityStatus } from './severity_status'

export interface ResourceAnalysisResult {
    action?: string;
    message?: string;
    resourceSummary?: {
        name: string,
        value: string
    };
    resource?: any;
    severity?: SeverityStatus;
    title?: string;
}