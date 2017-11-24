import * as Collectors from './collectors';
import { Dictionary } from './types';
import { CollectorUtil } from './utils';
import * as AWS from 'aws-sdk';
import * as Cli from 'cli';
import { writeFileSync } from 'fs';

const result: Dictionary<any> = {};

function copyDataToResult(keyPath, data) {
    result[keyPath] = result[keyPath] || {};
    for (let key in data) {
        result[keyPath][key] = data[key];
    }
}

let skippedCollectors = ['SnapshotsCollector'];
function collect(collectors: any, keyPath?: string) {
    for (let collectorName in collectors) {
        if (keyPath && collectorName.endsWith('Collector') &&
            collectors[collectorName] instanceof Function &&
            skippedCollectors.indexOf(collectorName) === -1) {
            // console.log("Executing", keyPath, collectorName)
            CollectorUtil.cachedCollect(new collectors[collectorName]())
                .then((data) => {
                    copyDataToResult(keyPath, data);
                }).catch((err) => {
                    console.error(keyPath, collectorName, err);
                });
        } else if (collectors[collectorName]) {
            const newKeyPath = keyPath ? `${keyPath}.${collectorName}` : collectorName
            collect(collectors[collectorName], newKeyPath);
        }
    }
}

const cliArgs = Cli.parse({
    profile: ['p', 'AWS profile name', 'string'],
    output: ['o', 'output file name', 'file', 'collection_report.json'],
    module: ['m', 'name of the module', 'string', 'all']
});

if (!cliArgs.profile) {
    Cli.getUsage();
}

AWS.config.signatureVersion = 'v4';
AWS.config.credentials = new AWS.SharedIniFileCredentials({
    profile: cliArgs.profile
});

if (cliArgs.module != 'all') {
    const moduleParts: string[] = cliArgs.module.split(".");
    const filterdCollectors = moduleParts.reduce((collectors, modulePart) => {
        return collectors[modulePart] || {};
    }, Collectors)
    collect(filterdCollectors, cliArgs.module);
}
else {
    collect(Collectors);
}

process.on('exit', function () {
    writeFileSync(cliArgs.output, JSON.stringify(result, null, 2), { encoding: 'utf-8' });
});








