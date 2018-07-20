import * as Cli from 'cli';
import * as AWS from 'aws-sdk';
import * as CollectorMain from './collect';
import * as AnalyzerMain from './analyze';
import * as Reporters from './reporters';

import {writeFileSync, existsSync, readFileSync} from 'fs';

const cliArgs = Cli.parse({
    profile: ['p', 'AWS profile name', 'string'],
    format: ["f", "output format: html, json or pdf", 'string', 'pdf'],
    output: ['o', 'output file name', 'file', 'scan_report'],
    module: ['m', 'name of the module', 'string'],
    debug: ['d', 'if you enable Debug then it will generate intermediate reports', 'boolean', false],
    reuseCollectorReport: ['u', 'Reuse collection report', 'boolean', false]
});

if (!cliArgs.profile) {
    Cli.getUsage();
}

if(["json", "pdf", "html"].indexOf(cliArgs.format) === -1) {
    Cli.getUsage();
}


AWS.config.signatureVersion = 'v4';
AWS.config.maxRetries = 3;
AWS.config.credentials = new AWS.SharedIniFileCredentials({
    profile: cliArgs.profile
});

const collectorReportFileName = "collector_report.json";

function makeFileName() {
    return cliArgs.output + "." + cliArgs.format;
}

async function makeFileContents(analyzedData) {
    switch(cliArgs.format) {
        case "json": {
            return JSON.stringify(analyzedData, null, 2);
        }
        case "html": {
            return Reporters.generateHTML(analyzedData);
        }
        case "pdf": {
            return Reporters.generatePDF(analyzedData);
        }
    }
}

async function getCollectorResults() {
    if(cliArgs.debug && cliArgs.reuseCollectorReport && existsSync(collectorReportFileName)) {
        console.info("Reusing collection report");
        return JSON.parse(readFileSync(collectorReportFileName, {encoding: "utf-8"}));
    }
    return await CollectorMain.collect(cliArgs.module);
}

async function scan() {
    try {
        const collectorResults = await getCollectorResults();
        if(cliArgs.debug) {
            writeFileSync(collectorReportFileName, JSON.stringify(collectorResults, null, 2));
            console.log(`${collectorReportFileName} is generated`);
        }
        const analyzedData = AnalyzerMain.analyze(collectorResults);
        if(cliArgs.debug) {
            const analyzerReportFileName = "analyzer_report.json";
            writeFileSync("analyzer_report.json", JSON.stringify(analyzedData, null, 2));
            console.log(`${analyzerReportFileName} is generated`);
        }
        const reportFileData = await makeFileContents(analyzedData);
        const reportFileName = makeFileName();
        writeFileSync(reportFileName, reportFileData);
        console.log(`${reportFileName} is generated`);
    } catch(err) {
        console.error(err);
    }
}

scan();
