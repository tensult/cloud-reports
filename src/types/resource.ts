import { SeverityStatus } from './severity'

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