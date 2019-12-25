import { IDictionary } from "./dictionary";
import { IResourceAnalysisResult } from "./resource";

export interface ICheckAnalysisResult {   
    why?: string;
    what?: string;
    recommendation?: string;
    reference?: string;
    resourceKeys?: string[];
    type: CheckAnalysisType;
    regions?: IDictionary<IResourceAnalysisResult[]>;
}

export enum CheckAnalysisType {
    Informational = "Informational",
    Security = "Security",
    Reliability = "Reliability",
    PerformanceEfficiency = "PerformanceEfficiency",
    CostOptimization = "CostOptimization",
    OperationalExcellence = "OperationalExcellence",
}
