import { Dictionary } from './dictionary'
import { ResourceAnalysisResult } from './resource'

export interface CheckAnalysisResult {
    why?: string;
    what?: string;
    recommendation?: string;
    reference?: string;
    resourceKeys?: string[];
    type: CheckAnalysisType | CheckAnalysisType[];
    regions?: Dictionary<ResourceAnalysisResult[]>;
}

export enum CheckAnalysisType {
    Informational = "Informational",
    Security = "Security",
    Reliability = "Reliability",
    PerformanceEfficiency = "PerformanceEfficiency",
    CostOptimization = "CostOptimization",
    OperationalExcellence = "OperationalExcellence"
}