import * as flat from "flat";
import * as Analyzers from "./analyzers";
import { BaseAnalyzer } from "./analyzers/base";
import { IDictionary } from "./types";

export function analyze(collectorData: any) {
    const flatListOfAnalyzers = flat(Analyzers);
    const result: IDictionary<any> = {};
    for (const analyzerName in flatListOfAnalyzers) {
        if (!analyzerName.endsWith("Analyzer")) {
            continue;
        }
        const analyzerNameSpace = analyzerName.replace(/.[A-Za-z0-9]+$/, "");
        if (!collectorData[analyzerNameSpace]) {
            continue;
        }
        const analyzer: BaseAnalyzer = new flatListOfAnalyzers[analyzerName]();
        const data = analyzer.analyze(collectorData[analyzerNameSpace], collectorData);
        result[analyzerNameSpace] = result[analyzerNameSpace] || {};
        result[analyzerNameSpace] = Object.assign(result[analyzerNameSpace], data);
    }
    return result;
}
