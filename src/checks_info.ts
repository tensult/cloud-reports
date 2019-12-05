import * as flat from "flat";
import * as Analyzers from "./analyzers";
import { BaseAnalyzer } from "./analyzers/base";
import * as FS from 'fs';

export function checksInfo() {
    const flatListOfAnalyzers = flat(Analyzers);
    const checks: string[] = [];
    checks.push("serviceName,checkName,checkDetails");
    for (const analyzerName in flatListOfAnalyzers) {
       // console.log('analyzer',analyzerName);
        if (!analyzerName.endsWith("Analyzer")) {
            continue;
        }
        const analyzerNameSpace = analyzerName.replace(/.[A-Za-z0-9]+$/, "");
        const analyzer: BaseAnalyzer = new flatListOfAnalyzers[analyzerName]();
        if(analyzer.checks_what) {
            checks.push(`${analyzerNameSpace},${analyzer.checks_what},${analyzer.checks_why}`);
        }
    }
    FS.writeFileSync("./cloud_report_checks.csv", checks.join("\n"), {encoding: "utf-8"});
}

checksInfo();
