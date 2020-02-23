import * as AWS from "aws-sdk";
import * as Cli from "cli";
import * as Moment from "moment";
import * as opn from "opn";

import * as AnalyzerMain from "./analyze";
import * as CollectorMain from "./collect";
import * as Reporters from "./reporters";

import { existsSync, readFileSync, writeFileSync } from "fs";
import { AWSCredentialsProvider } from "./utils/aws/credentials";
import { LogUtil } from "./utils/log";


const cliArgs = Cli.parse({
    debug: ["d", "if you enable Debug then it will generate intermediate reports", "boolean", false],
    format: ["f", "output format: html, json, csv or pdf", "string", "html"],
    issuesOnly: ["i", "should show only issues", "boolean", false],
    logLevel: ["l", "Log level: off=100, info=1, warning=2, error=3", "int", "3"],
    module: ["m", "name of the module(s)", "string"],
    regions: ["r", "name of the region(s)", "string"],
    output: ["o", "Report file name", "string", "scan_report"],
    outputDir: ["D", "Output directory", "string", "."],
    profile: ["p", "AWS profile name", "string", "default"],
    reuseCollectorReport: ["u", "Reuse collection report", "boolean", false],
});

LogUtil.setCurrentLogLevel(cliArgs.logLevel);

if (["json", "csv", "pdf", "html"].indexOf(cliArgs.format) === -1) {
    Cli.getUsage();
}

AWS.config.signatureVersion = "v4";
AWS.config.maxRetries = 3;

const collectorReportFileName = cliArgs.outputDir + "/collector_report.json";

function makeFileName(accountNumber) {
    return cliArgs.outputDir + "/" + cliArgs.output + "_" + accountNumber + "_" +
        Moment().format("YYYY-MM-DD-hh-mm-ss") + "." + cliArgs.format;
}

async function makeFileContents(analyzedData) {
    switch (cliArgs.format) {
        case "json": {
            return JSON.stringify(analyzedData, null, 2);
        }
        case "csv": {
            return Reporters.generateCSV(analyzedData, { showIssuesOnly: cliArgs.issuesOnly });
        }
        case "html": {
            writeFileSync("src/reporters/html/dist/html-report/assets/data.json",
                JSON.stringify(analyzedData, null, 2));
            const serveStatic = require("serve-static");
            const finalhandler = require("finalhandler");
            const http = require("http");
            const serve = serveStatic("src/reporters/html/dist/html-report/", { index: ["index.html"] });
            // Create server
            const server = http.createServer(function onRequest(req, res) {
                serve(req, res, finalhandler(req, res));
            });

            // Listen
            server.listen(3000);
            opn("http://localhost:3000");
        }
        case "pdf": {
            return Reporters.generatePDF(analyzedData, { showIssuesOnly: cliArgs.issuesOnly, debug: cliArgs.debug });
        }
        default: throw new Error("Unsupported report format");
    }
}

async function getCollectorResults() {
    if (cliArgs.debug && cliArgs.reuseCollectorReport && existsSync(collectorReportFileName)) {
        LogUtil.log("Reusing collection report");
        return JSON.parse(readFileSync(collectorReportFileName, { encoding: "utf-8" }));
    }
    const credentials = await AWSCredentialsProvider.getCredentials(cliArgs.profile);
    return await CollectorMain.collect({moduleNames: cliArgs.module, credentials, regions: cliArgs.regions});
}
function getAccountNumber(analyzedData) {
    if (analyzedData["aws.account"]) {
        return analyzedData["aws.account"].summary.regions.global[0].resourceSummary.value;
    }
    return "";
}


async function scan() {
    try {
        const collectorResults = await getCollectorResults();
        if (cliArgs.debug) {
            writeFileSync(collectorReportFileName, JSON.stringify(collectorResults, null, 2));
            LogUtil.log(`${collectorReportFileName} is generated`);
        }
        const analyzedData = AnalyzerMain.analyze(collectorResults);
        const accountNumber = getAccountNumber(analyzedData);


        if (cliArgs.debug) {
            const analyzerReportFileName = cliArgs.outputDir + "/analyzer_report.json";
            writeFileSync(analyzerReportFileName, JSON.stringify(analyzedData, null, 2));
            LogUtil.log(`${analyzerReportFileName} is generated`);
        }
        const reportFileData = await makeFileContents(analyzedData);
        if (cliArgs.format !== "html") {
            const reportFileName = makeFileName(accountNumber);

            writeFileSync(reportFileName, reportFileData);
            LogUtil.log(`${reportFileName} is generated`);
            opn(reportFileName, { wait: false });
        }

    } catch (err) {
        LogUtil.log(err);
    }
}

scan();
