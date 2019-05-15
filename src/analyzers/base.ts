
export abstract class BaseAnalyzer {
    public checks_what : string ="";
    public checks_why : string = "";
    public checks_recommendation : string = "";
    public checks_name : string = "";

    public abstract analyze(params: any, fullReport?: any);
}
