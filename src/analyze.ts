import * as Analyzers from './analyzers';
import { BaseAnalyzer } from './analyzers/base';
import { Dictionary } from './types';
import * as Cli from 'cli';
import { readFileSync, writeFileSync } from 'fs';

const result: Dictionary<any> = {};

function copyDataToResult(keyPath, data) {
    if (!data) {
        return;
    }
    result[keyPath] = result[keyPath] || {};
    for (let key in data) {
        result[keyPath][key] = data[key];
    }
}

let skippedAnalyzers: string[] = [];
function analyze(analyzers: any, report: any, keyPath?: string) {
    for (let analyzerName in analyzers) {
        if (keyPath && analyzerName.endsWith('Analyzer') &&
            analyzers[analyzerName] instanceof Function &&
            skippedAnalyzers.indexOf(analyzerName) === -1) {
            const analyzer: BaseAnalyzer = new analyzers[analyzerName]();
            let result = analyzer.analyze(report[keyPath], report);
            copyDataToResult(keyPath, result);
        } else if (analyzers[analyzerName]) {
            const newKeyPath = keyPath ? `${keyPath}.${analyzerName}` : analyzerName
            analyze(analyzers[analyzerName], report, newKeyPath);
        }
    }
}

const cliArgs = Cli.parse({
    analyzer: ['a', 'Analyzer type', 'string', 'security'],
    report_file: ['r', 'Report JSON file name', 'file'],
    output: ['o', 'output file name', 'file', 'analysis_report.json']
});

if (!cliArgs.report_file) {
    Cli.getUsage();
}

const report = JSON.parse(readFileSync(cliArgs.report_file, 'utf-8'));
analyze(Analyzers[cliArgs.analyzer], report);
process.on('exit', function () {
    writeFileSync(cliArgs.output, JSON.stringify(result, null, 2), { encoding: 'utf-8' });
  });
