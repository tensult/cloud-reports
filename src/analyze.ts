import * as Analyzers from './analyzers';
import { Dictionary } from './types';
import * as flat from 'flat';
import { BaseAnalyzer } from './analyzers/base';

export function analyze(collectorData: any) {
    const flatListOfAnalyzers = flat(Analyzers);
    const result: Dictionary<any> = {}
    for (let analyzerName in flatListOfAnalyzers) {
        if (!analyzerName.endsWith('Analyzer')) {
            continue;
        }
        const analyzerNameSpace = analyzerName.replace(/.[A-Za-z]+$/, '');
        if(!collectorData[analyzerNameSpace]) {
            continue;
        }
        const analyzer: BaseAnalyzer = new flatListOfAnalyzers[analyzerName]();
        const data = analyzer.analyze(collectorData[analyzerNameSpace], collectorData);
        result[analyzerNameSpace] = result[analyzerNameSpace] || {};
        result[analyzerNameSpace] = Object.assign(result[analyzerNameSpace], data);
    }
    return result;
}