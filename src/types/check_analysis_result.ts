import { Dictionary } from './dictionary'
import { ResourceAnalysisResult } from './resource_analysis_result'

export interface CheckAnalysisResult {
    why?: string;
    what?: string;
    recommendation?: string;
    reference?: string;
    resourceKeys?: string[];
    regions?: Dictionary<ResourceAnalysisResult[]>;
}