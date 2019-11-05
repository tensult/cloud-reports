const AWS = require("aws-sdk/clients/all");
const cheerio = require("cheerio");
const fs = require("fs");
const fetch = require("node-fetch");

fetch("http://docs.aws.amazon.com/general/latest/gr/rande.html")
  .then(function(res) {
    return res.text();
  }).then(function(body) {
    extractServiceRegions(body);
  });

function extractServiceRegions(html) {
  const $ = cheerio.load(html);
  const service_regions = {};
  $("h2[id*='region']").each(function(index, elm) {
    let service = $(elm);
    let fullServiceName = service.text().split("(")[0].trim();
    let serviceName = fullServiceName.replace(/(Amazon|AWS)/g, "").trim();
    let shortName = serviceName.split(/\s/).reduce(function(prev, curr) {
      return prev + curr.charAt(0);
    }, "");

    let fullShortName = fullServiceName.split(/\s/).reduce(function(prev, curr) {
      return prev + curr.charAt(0);
    }, "");
    let regions = [];
    let cleanupSelector = `#${service.attr("id")} + :not(div[class$=table])`;
    let regionSelector = `#${service.attr("id")} + div table td:nth-child(2)`;
    $(cleanupSelector).remove();
    $(regionSelector).each(function(index, elm) {
      let region = $(elm);
      regions.push(region.text().trim());
    });
    service_regions[serviceName.replace(/\s/g, "")] = {
      fullShortName,
      regions,
      shortName,
    };
  });

  const actualServiceRegionsV1 = {};
  for (let serviceActualName in AWS) {
    for (let serviceExtractedName in service_regions) {
      if ((serviceExtractedName.includes(serviceActualName) ||
        service_regions[serviceExtractedName].shortName === serviceActualName ||
        service_regions[serviceExtractedName].fullShortName === serviceActualName) &&
        service_regions[serviceExtractedName].regions.length) {
        actualServiceRegionsV1[serviceActualName] = service_regions[serviceExtractedName].regions;
      }
    }
  }

  const actualServiceRegionsV2 = Object.assign({}, actualServiceRegionsV1);

  for (let serviceName in AWS) {
    if (!actualServiceRegionsV2[serviceName]) {
      for (let serviceNameV1 in actualServiceRegionsV1) {
        if (serviceName.indexOf(serviceNameV1) !== -1) {
          actualServiceRegionsV2[serviceName] = actualServiceRegionsV2[serviceNameV1];
        }
      }
    }
  }

  const regionData = "export let regions = " + JSON.stringify(actualServiceRegionsV2, null, 2);
  fs.writeFileSync(__dirname + "/../utils/aws/regions_data.ts", regionData, "utf-8");
}
