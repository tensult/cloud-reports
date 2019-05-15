import {
    CheckAnalysisType, ICheckAnalysisResult,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { CloudFrontUtil } from "../../../utils/aws/cloudfront";
import { BaseAnalyzer } from "../../base";

export class FieldLevelEncrytionAnalyzer extends BaseAnalyzer {
    public checks_what : string =  "Is field level encryption enabled in the CloudFront web distribution?";
    public checks_why : string =  `It is important, in order to help protect sensitive data like credit card numbers or social security numbers, 
    and to help protect your data across application services.`;
    public checks_recommendation: string = "Recommended to enable  field level encryption for all distributions";
    public checks_name: string = "Distribution";
    public analyze(params: any, fullReport?: any): any {
        const allFieldLevelEncryptionConfigs: any[] = params.distribution_configs;

        if (!allFieldLevelEncryptionConfigs) {
            return undefined;
        }
        const field_level_encryption_enabled: ICheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        field_level_encryption_enabled.what = this.checks_what;
        field_level_encryption_enabled.why = this.checks_why;
        field_level_encryption_enabled.recommendation = this.checks_recommendation;
        const allFieldLevelEncryptionAnalysis: IResourceAnalysisResult[] = [];
        for (const field_level_encryption_Id in allFieldLevelEncryptionConfigs) {
            const field_level_encryption = allFieldLevelEncryptionConfigs[field_level_encryption_Id];
            const field_level_encryption_Analysis: IResourceAnalysisResult = {};

            field_level_encryption_Analysis.resource = {field_level_encryption_Id, logging: field_level_encryption.Logging };
            const field_level_encryption_Alias = CloudFrontUtil.getAliasName(field_level_encryption);
            field_level_encryption_Analysis.resourceSummary = {
                name: this.checks_name,
                value: field_level_encryption_Alias ? `${field_level_encryption_Alias} | ${field_level_encryption_Id}` : field_level_encryption_Id,
            };
            if (field_level_encryption.Logging.Enabled) {
                field_level_encryption_Analysis.severity = SeverityStatus.Good;
                field_level_encryption_Analysis.message = "Field level encryption  are enabled";
            } else {
                field_level_encryption_Analysis.severity = SeverityStatus.Warning;
                field_level_encryption_Analysis.message = "Field level encryption  are not enabled";
                field_level_encryption_Analysis.action = "Enable  field level encryption";
            }
            allFieldLevelEncryptionAnalysis.push(field_level_encryption_Analysis);
        }
        field_level_encryption_enabled.regions = { global: allFieldLevelEncryptionConfigs };
        return { field_level_encryption_enabled};
    }
}
