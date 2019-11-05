
export abstract class BaseAnalyzer {
    public checkWhat: string = "";
    public checkWhy: string = "";

    public abstract analyze(params: any, fullReport?: any);
}
