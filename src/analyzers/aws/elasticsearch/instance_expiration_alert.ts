import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class InstanceExpirationAlertsAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const millsIn30Days = 30 * 24 * 60 * 60 * 1000;
        const allDomains = params.domains;
        const allReservedInstances = params.reserved_instances;
        if (!allDomains || !allReservedInstances) {
            return undefined;
        }
        const instance_expiration_alerts: ICheckAnalysisResult = { type: CheckAnalysisType.CostOptimization };
        instance_expiration_alerts.what = "Are all Elasticsearch reserved instances active?";
        instance_expiration_alerts.why = `You have to renew all the Easticsearch Service Reserved Instances 
        which you are going to run for long time to save the cost.`;
        instance_expiration_alerts.recommendation = "Recommended to renew all reserved instances to save yourself from paying higher costs.";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allDomains) {
            const regionReservedInstances = allReservedInstances[region];
            allRegionsAnalysis[region] = [];
            for (const instances of regionReservedInstances) {
                if (!instances) {
                    continue;
                }
                const r_Instances_Analysis: IResourceAnalysisResult = {};
                r_Instances_Analysis.resource = instances;
                const ReservationName = instances.ReservationName;
                let StartTime = instances.StartTime;
                const Duration = instances.Duration;
                const FixedPrice = instances.FixedPrice;
                const Code = instances.CurrencyCode;
                const Charges = instances.RecurringCharges;
                const State = instances.State;
                const presentState = this.getInstancesReservedState(State);
                r_Instances_Analysis.title = `${ReservationName} | ${State}`;
                if (presentState.indexOf("active") != -1) {
                    r_Instances_Analysis.severity = SeverityStatus.Good;
                    r_Instances_Analysis.message = "The Instance are reserved and no need to renew them.";
                } else {
                    r_Instances_Analysis.severity = SeverityStatus.Failure;
                    r_Instances_Analysis.message = `Time is out for renewal of the reserved instance you were using.
                    Pay Recurring charges (hourly) for further use of the service. Charges are been described under title.`;
                    r_Instances_Analysis.resourceSummary = {
                        name: "Recurring Charges",
                        value: Charges,
                    };
                    r_Instances_Analysis.action = `If you don't wanna be Charged for the use of service kindly renew your service.`;
                }
                allRegionsAnalysis[region].push(r_Instances_Analysis);
            }
        }
        instance_expiration_alerts.regions = allRegionsAnalysis;
        return { instance_expiration_alerts };
    }

    private getInstancesRenewTime(StartTime, Duration) {
        const RemainingTime = StartTime - Duration;
        return RemainingTime;

    }

    private getInstancesReservedState(State) {
        const presentState = State;
        return presentState;
    }

}
