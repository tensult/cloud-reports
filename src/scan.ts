import * as Cli from 'cli';
import * as AWS from 'aws-sdk';
import * as Moment from 'moment';
const opn = require('opn');

import * as CollectorMain from './collect';
import * as AnalyzerMain from './analyze';
import * as Reporters from './reporters';

import {writeFileSync, existsSync, readFileSync} from 'fs';
import { LogUtil } from './utils/log';

const cliArgs = Cli.parse({
    profile: ['p', 'AWS profile name', 'string'],
    format: ["f", "output format: html, json or pdf", 'string', 'html'],
    output: ['o', 'Report file name', 'string', 'scan_report'],
    outputDir: ['D', 'Output directory', 'string', '.'],
    module: ['m', 'name of the module', 'string'],
    debug: ['d', 'if you enable Debug then it will generate intermediate reports', 'boolean', false],
    reuseCollectorReport: ['u', 'Reuse collection report', 'boolean', false],
    logLevel: ['l', "Log level: off=100, info=1, warning=2, error=3", "int", "3"]
});

if (!cliArgs.profile && !cliArgs.reuseCollectorReport) {
    Cli.getUsage();
}

LogUtil.setCurrentLogLevel(cliArgs.logLevel);

if(["json", "pdf", "html"].indexOf(cliArgs.format) === -1) {
    Cli.getUsage();
}


AWS.config.signatureVersion = 'v4';
AWS.config.maxRetries = 3;
const credentials = new AWS.SharedIniFileCredentials({
    profile: cliArgs.profile
});

const collectorReportFileName = cliArgs.outputDir  + "/collector_report.json";

function makeFileName() {
    return cliArgs.outputDir + "/" + cliArgs.output + "_" + 
    Moment().format("YYYY-MM-DD-hh-mm-ss") + "." + cliArgs.format;
}

async function makeFileContents(analyzedData) {
    switch(cliArgs.format) {
        case "json": {
            return JSON.stringify(analyzedData, null, 2);
        }
        case "html": {
            writeFileSync("src/reporters/html/dist/html-report/assets/data.json", JSON.stringify(analyzedData, null, 2));
            const serveStatic = require('serve-static')
            const finalhandler = require('finalhandler')
            const http = require('http')
            const serve = serveStatic('src/reporters/html/dist/html-report/', {'index': ['index.html']})
            // Create server
            const server = http.createServer(function onRequest (req, res) {
                serve(req, res, finalhandler(req, res))
            });
            
            // Listen
            server.listen(3000)
            opn("http://localhost:3000");
        }
        case "pdf": {
            return Reporters.generatePDF(analyzedData);
        }
    }
}

async function getCollectorResults() {
    if(cliArgs.debug && cliArgs.reuseCollectorReport && existsSync(collectorReportFileName)) {
        LogUtil.log("Reusing collection report");
        return JSON.parse(readFileSync(collectorReportFileName, {encoding: "utf-8"}));
    }
    return await CollectorMain.collect(cliArgs.module, credentials);
}

async function scan() {
    try {
        const collectorResults = await getCollectorResults();
        if(cliArgs.debug) {
            writeFileSync(collectorReportFileName, JSON.stringify(collectorResults, null, 2));
            LogUtil.log(`${collectorReportFileName} is generated`);
        }
        const analyzedData = AnalyzerMain.analyze(collectorResults);
        if(cliArgs.debug) {
            const analyzerReportFileName = cliArgs.outputDir + "/analyzer_report.json";
            writeFileSync(analyzerReportFileName, JSON.stringify(analyzedData, null, 2));
            LogUtil.log(`${analyzerReportFileName} is generated`);
        }
        const reportFileData = await makeFileContents(analyzedData);
        if(cliArgs.format !== 'html') {
            const reportFileName = makeFileName();
            writeFileSync(reportFileName, reportFileData);
            LogUtil.log(`${reportFileName} is generated`);
            opn(reportFileName, {wait: false});
        }
        
    } catch(err) {
        LogUtil.log(err);
    }
}

scan();
