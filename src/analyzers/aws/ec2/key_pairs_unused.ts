import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class KeyPairsUnusedAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allKeyPairs = params.key_pairs;
        const allInstances = params.instances;
        if (!allKeyPairs || !allInstances) {
            return undefined;
        }
        const key_pairs_unused: CheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        key_pairs_unused.what = "Are there any key pairs unused?";
        key_pairs_unused.why = "Unused key pairs causes confusion and allows to make mistakes"
        key_pairs_unused.recommendation = "Recommended delete unused key pairs";
        const allRegionsAnalysis: Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allInstances) {
            let regionInstances = allInstances[region];
            let regionKeyPairs = allKeyPairs[region];
            allRegionsAnalysis[region] = [];
            let usedKeyPairs = regionInstances.map(instance => {
                return instance.KeyName;
            });

            regionKeyPairs.forEach(keyPair => {
                let keyPairAnalysis: ResourceAnalysisResult = {};
                keyPairAnalysis.resource = keyPair;
                keyPairAnalysis.resourceSummary = { name: 'KeyPair', value: keyPair.KeyName };
                if (usedKeyPairs.indexOf(keyPair.KeyName) !== -1) {
                    keyPairAnalysis.severity = SeverityStatus.Good;
                    keyPairAnalysis.message = 'Key pair is used';
                } else {
                    keyPairAnalysis.severity = SeverityStatus.Warning;
                    keyPairAnalysis.message = 'Key pair is not used';
                    keyPairAnalysis.action = 'Delete the key pair';
                }
                allRegionsAnalysis[region].push(keyPairAnalysis);
            });
        }
        key_pairs_unused.regions = allRegionsAnalysis;
        return { key_pairs_unused };
    }
}