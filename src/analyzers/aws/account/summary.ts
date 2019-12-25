import { CheckAnalysisType, ICheckAnalysisResult, SeverityStatus } from "../../../types";
import { BaseAnalyzer } from "../../base";

export class AccountIdAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const accountId = params.id;
        if (!accountId) {
            return undefined;
        }
        const summary: ICheckAnalysisResult = { type: CheckAnalysisType.Informational };
        summary.what = "Cloud reports scans and reports issues about the AWS Account";
        summary.why = `AWS cloud offers several security features but it also
        enforces a shared responsibility so we need to keep reviewing the
         account and fixing the issues.`;
        summary.recommendation = "Recommended to run the Cloud reports at least once in month.";
        summary.regions = {
            global: [{
                action: "Run Cloud Reports on regular basis",
                message: `${new Date().toString()}`,
                resourceSummary: {
                    name: "AccountId",
                    value: accountId,
                },
                severity: SeverityStatus.Info,
            }],
        };

    //     var list = [
    //         {severity: "Info"}
    //     ];
    //     var langCount = {};
    //     for(var i=0;i<list.length;i++){
	//     var obj = list[i];
    //     if(langCount.hasOwnProperty(obj["severity"])){
  	//         langCount[obj["severity"]]++;
    //     }else{
  	//         langCount[obj["severity"]] = 1;
    //     }
    // }
    // console.log("account",langCount);
        // var counts = {};
        // var severitycount = [SeverityStatus];
        
        // severitycount.forEach(function (severitysummary) {
        
        //     if (!counts.hasOwnProperty(severitysummary.Warning)) {
        //         counts[severitysummary.Warning] = 0;
        //     }
           
        //     counts[severitysummary.Warning] += 1;
        // });
        
        // console.log(counts);
        // getseveritydata(analyzedData) {
        //     if (analyzedData["aws.account"]) {
        //         console.log("account",analyzedData);
        //         return analyzedData.keys["aws.account"].summary.regions.global[0].severity.length;
        //     }
        //     // return "";
        // }
        // var jsonObject = {SeverityStatus};
        // var keyCount  = Object.keys(jsonObject).length;
        // console.log("keyCount",keyCount);
 
        // var myObject = { 'severity': 'Info'}

        // var count = Object.keys(myObject).length;
        // console.log(count);
        return { summary };
    }
  
    
    // countseverity(summary) {
    //     console.log("account",summary);
        
      
    //     return Object.keys(summary.regions.severity).length;
    
    // }
}
