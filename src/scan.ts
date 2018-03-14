import * as Cli from 'cli';
import * as AWS from 'aws-sdk';
import * as CollectorMain from './collect';
import * as AnalyzerMain from './analyze';
import {writeFileSync} from 'fs';

const cliArgs = Cli.parse({
    profile: ['p', 'AWS profile name', 'string'],
    output: ['o', 'output file name', 'file', 'scan_report.json'],
    module: ['m', 'name of the module', 'string']
});

if (!cliArgs.profile) {
    Cli.getUsage();
}

AWS.config.signatureVersion = 'v4';
AWS.config.credentials = new AWS.SharedIniFileCredentials({
    profile: cliArgs.profile
});

async function scan() {
    try {
        const collectorResults = await CollectorMain.collect(cliArgs.module);
        const analyzedData = AnalyzerMain.analyze(collectorResults);
        writeFileSync(cliArgs.output, JSON.stringify(analyzedData, null, 2));
    } catch(err) {
        console.error(err);
    }
}

scan();
