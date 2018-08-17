import { ArrayUtil } from './../../utils/array';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class CloudReportService {

    scanReportData;
    private awsRegions = [
        'us-east-1',
        'us-east-2',
        'us-west-1',
        'us-west-2',
        'ca-central-1',
        'eu-west-1',
        'eu-west-2',
        'eu-west-3',
        'eu-central-1',
        'ap-northeast-1',
        'ap-northeast-2',
        'ap-southeast-1',
        'ap-southeast-2',
        'ap-south-1',
        'sa-east-1',
        'cn-north-1',
        'cn-northwest-1',
        'ap-northeast-3',
    ]


    constructor(private http: HttpClient) { }

    /****************** General  *******************/

    checkHasData(data: string, dataArray: string[]) {
        for (let i = 0; i < dataArray.length; i++) {
            if (data === dataArray[i]) {
                return true;
            }
        }
        return false;
    }

    replaceUnderscoreWithSpace(string) {
        return string.split('_').join(' ');
    }

    replaceSpaceWithUnderscore(string) {
        return string.split(' ').join('_');
    }

    /**************************************************/

    private fetchScanReportData() {
        return this.http.get('assets/data.json');
    }

    getAllRegions() {
        return this.awsRegions;
    }

    getRegionsByFilteredReportData(filteredReportData) {
        let regions = [];
        for (let serviceObjectKey in filteredReportData) {
            for (let serviceCheckCategoryObjectKey in filteredReportData[serviceObjectKey]) {
                const regionsObject = filteredReportData[serviceObjectKey][serviceCheckCategoryObjectKey].regions;
                for (let regionsObjectKey in regionsObject) {
                    if (regionsObject[regionsObjectKey].length > 0 && !this.checkHasData(regionsObjectKey, regions)) {
                        regions.push(regionsObjectKey);
                    }
                }
            }
        }
        return regions;
    }

    getScanReportData() {
        if (!this.scanReportData) {
            this.scanReportData = this.fetchScanReportData();
        }
        return this.scanReportData;
    }
    /**
     * Get report dashboard data
    */
    getDashboardData(data) {
        // console.log(data);

        let dashboardData: object[] = [];
        for (let serviceObjectKey in data) {  // each service
            let serviceData: object = {};
            serviceData['service'] = serviceObjectKey.split('.')[1];
            serviceData['noOfChecks'] = 0;
            serviceData['noOfFailures'] = 0;
            for (let checkObjectKey in data[serviceObjectKey]) {
                if (data[serviceObjectKey][checkObjectKey].regions.hasOwnProperty('global')) {
                    const resources = data[serviceObjectKey][checkObjectKey].regions.global;
                    for (let i = 0; i < resources.length; i++) {
                        const severity = resources[i].severity;
                        serviceData['noOfChecks']++;
                        if (severity === 'Warning' || severity === 'Failure') {
                            serviceData['noOfFailures']++;
                        }
                    }
                }
                else {
                    for (let region in data[serviceObjectKey][checkObjectKey].regions) {
                        const resources = data[serviceObjectKey][checkObjectKey].regions[region];
                        // console.log(resources)
                        for (let i = 0; i < resources.length; i++) {
                            const severity = resources[i].severity;
                            // console.log(serviceObjectKey +' '+ checkObjectKey +' '+ severity);
                            serviceData['noOfChecks']++;
                            if (severity === 'Warning' || severity === 'Failure') {
                                serviceData['noOfFailures']++;
                            }
                        }
                    }
                }
            }
            if (serviceData['noOfChecks'] == 0) {
                continue;
            }
            dashboardData.push(serviceData);
        }
        return dashboardData;
    }

    /**
     * Return true if has data
     * otherwise false
    */
    checkServiceCheckCategoryHasData(checkCategoryObject) {
        const regionsObject = checkCategoryObject['regions'];
        for (let regionsObjectKey in regionsObject) {
            if (regionsObject[regionsObjectKey].length >= 1) {
                return true;
            }
        }
        return false;
    }

    isServiceGlobal(service) {
        if (service === 's3' || service === 'cloudfront' || service === 'cloudformation') {
            return true;
        }
        return false;
    }

    /** 
     * Check Category functions 
     * */
    getCheckCategoryData(service, region, data) {
        // console.log(service, region)
        let checkCategoryData: object[] = [];
        let regionsHaveData = [];
        for (let serviceObjectKey in data) {
            if (serviceObjectKey === service) {
                for (let checkCategoryObjectKey in data[serviceObjectKey]) {
                    let serviceData: object = {};
                    serviceData['badConditionCount'] = 0;
                    serviceData['goodConditionCount'] = 0;
                    serviceData['checkCategoryName'] = this.replaceUnderscoreWithSpace(checkCategoryObjectKey);
                    const regionsObject = data[serviceObjectKey][checkCategoryObjectKey]['regions'];
                    if (regionsObject.hasOwnProperty('global')) {
                        if (regionsObject.global.length < 1) {
                            continue;
                        }
                        else if (regionsObject.global.length > 1) {
                            if (!this.checkHasData('global', regionsHaveData)) {
                                regionsHaveData.push('global')
                                serviceData['regionsHaveData'] = regionsHaveData;
                            }
                            for (let i = 0; i < regionsObject.global.length; i++) {
                                const resourceObject = regionsObject.global[i];
                                const severity = resourceObject.severity;
                                if (resourceObject.severity === 'Good') {
                                    serviceData['goodConditionCount']++;
                                }
                                else if (severity === 'Warning' || severity === 'Failure') {
                                    serviceData['badConditionCount']++;
                                }
                            }
                        }
                    }
                    else if (region === 'all') {
                        for (let regionsObjectKey in regionsObject) {
                            const regionData = regionsObject[regionsObjectKey];
                            if (regionData.length < 1) {
                                continue;
                            }
                            else if (regionData.length >= 1) {
                                if (!this.checkHasData(regionsObjectKey, regionsHaveData))
                                    regionsHaveData.push(regionsObjectKey);
                                for (let i = 0; i < regionData.length; i++) {
                                    const resourceObject = regionData[i];
                                    const severity = resourceObject.severity;
                                    if (resourceObject.severity === 'Good') {
                                        serviceData['goodConditionCount']++;
                                    }
                                    else if (severity === 'Warning' || severity === 'Failure') {
                                        serviceData['badConditionCount']++;
                                    }
                                }
                            }
                        }
                        serviceData['regionsHaveData'] = regionsHaveData;
                    }
                    else {
                        for (let regionsObjectKey in regionsObject) {
                            if (regionsObjectKey === region) {
                                const regionData = regionsObject[regionsObjectKey];
                                if (regionData.length < 1) {
                                    continue;
                                }
                                else if (regionData.length >= 1) {
                                    for (let i = 0; i < regionData.length; i++) {
                                        const resourceObject = regionData[i];
                                        const severity = resourceObject.severity;
                                        if (resourceObject.severity === 'Good') {
                                            serviceData['goodConditionCount']++;
                                        }
                                        else if (severity === 'Warning' || severity === 'Failure') {
                                            serviceData['badConditionCount']++;
                                        }
                                    }
                                    if (!this.checkHasData(region, regionsHaveData))
                                        regionsHaveData.push(region);
                                }
                            }
                        }
                        serviceData['regionsHaveData'] = regionsHaveData;
                    }
                    if (serviceData['badConditionCount'] == 0 && serviceData['goodConditionCount'] == 0) {
                        continue;
                    }
                    checkCategoryData.push(serviceData);
                }
            }
        }
        return checkCategoryData;
    }

    getRegionsHaveData(data, service) {
        let regionsHaveData = [];
        for (let serviceObjectKey in data) {
            if (service && serviceObjectKey !== service) {
                continue;
            }
            for (let checkCategoryKey in data[serviceObjectKey]) {
                for (let regionObjectKey in data[serviceObjectKey][checkCategoryKey].regions) {
                    if (data[serviceObjectKey][checkCategoryKey].regions[regionObjectKey].length >= 1) {
                        if (!this.checkHasData(regionObjectKey, regionsHaveData))
                            regionsHaveData.push(regionObjectKey);
                    }
                }
            }

        }
        return regionsHaveData;
    }

    manageRegion(region?, service?, data?) {
        if (!region && !localStorage.getItem('awsRegion')) {
            localStorage.setItem('awsRegion', 'all');
        }
        else if (region) {
            localStorage.setItem('awsRegion', region);
        }
        else if (service && !region && data) {
            const selectedRegion = localStorage.getItem('awsRegion');
            const regionsHaveData = this.getRegionsHaveData(data, service);
            for (let i = 0; i < regionsHaveData.length; i++) {
                if (selectedRegion == regionsHaveData[i]) {
                    return localStorage.getItem('awsRegion');
                }
            }
            localStorage.setItem('awsRegion', 'all');
        }
        return localStorage.getItem('awsRegion');
    }


    /************************************ check detail page start ***********************************************/

    getCheckDetailData(data, service?: string, checkCategory?: string, region?: string, severities?: string[]) {

        let filterredData = data;
        if (ArrayUtil.isNotBlank(service)) {
            filterredData = {
                [service]: data[service]
            }
            if (ArrayUtil.isNotBlank(checkCategory)) {
                checkCategory = this.replaceSpaceWithUnderscore(checkCategory.toLowerCase());
                filterredData[service] = {
                    [checkCategory]: filterredData[service][checkCategory]
                }
            }
        }

        if (ArrayUtil.isNotBlank(region)) {
            for (let serviceIndex in filterredData) {
                for (let checkCategoryIndex in filterredData[serviceIndex]) {
                    if (filterredData[serviceIndex][checkCategoryIndex].regions[region]) {
                        filterredData[serviceIndex][checkCategoryIndex].regions = {
                            [region]: filterredData[serviceIndex][checkCategoryIndex].regions[region]
                        }
                    }
                }
            }
        }

        if (ArrayUtil.isNotBlank(severities)) {
            for (let serviceIndex in filterredData) {
                for (let checkCategoryIndex in filterredData[serviceIndex]) {
                    for (let regionIndex in filterredData[serviceIndex][checkCategoryIndex].regions) {
                        if (!filterredData[serviceIndex][checkCategoryIndex].regions[regionIndex]) {
                            continue;
                        }
                        filterredData[serviceIndex][checkCategoryIndex].regions[regionIndex] = filterredData[serviceIndex][checkCategoryIndex].regions[regionIndex].filter((checkData) => {
                            return severities.indexOf(checkData.severity) !== -1;
                        });
                    }
                }
            }
        }
        return filterredData;
    }


    checkForSameData(objectArray, objectKey, objectKeyValue) {
        for (let i = 0; i < objectArray.length; i++) {
            if (objectArray[i][objectKey] === objectKeyValue) {
                return true;
            }
        }
        return false;
    }

    checkSeverityHasServiceData(reportData, service, severity) {
        if (reportData.hasOwnProperty(service)) {
            for (let checkCategoryObjectKey in reportData[service]) {
                const regionsObject = reportData[service][checkCategoryObjectKey].regions;
                for (let regionsObjectKey in regionsObject) {
                    for (let j = 0; j < regionsObject[regionsObjectKey].length; j++) {
                        for (let i = 0; i < severity.length; i++) {
                            if (severity[i] === regionsObject[regionsObjectKey][j]['severity']) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        }
    }

    checkRegionHasServiceData(reportData, service, region) {
        if (reportData.hasOwnProperty(service)) {
            for (let checkCategoryObjectKey in reportData[service]) {
                const regionsObject = reportData[service][checkCategoryObjectKey].regions;
                if (regionsObject.hasOwnProperty(region) && regionsObject[region].length > 0) {
                    return true;
                }
            }
            return false;
        }
    }

    getServices(reportData, region, severity) {
        // console.log(region, severity);
        let services = [];
        for (let serviceObjectKey in reportData) {
            for (let checkCategoryObjectKey in reportData[serviceObjectKey]) {
                const regionsObject = reportData[serviceObjectKey][checkCategoryObjectKey].regions;
                if (!this.checkForSameData(services, 'service', serviceObjectKey)) {
                    if (region) {
                        // Region
                        if (this.checkRegionHasServiceData(reportData, serviceObjectKey, region)) {
                            // Region has service data
                            if (severity && severity[0]) {
                                if (this.checkSeverityHasServiceData(reportData, serviceObjectKey, severity)) {
                                    // Severity has service data
                                    services.push({
                                        service: serviceObjectKey,
                                        regionStatus: true,
                                        severityStatus: true
                                    })
                                }
                                else {
                                    // Severity does not have service data
                                    services.push({
                                        service: serviceObjectKey,
                                        regionStatus: true,
                                        severityStatus: false
                                    })
                                }
                            }
                            else {
                                // Region, No Severity
                                services.push({
                                    service: serviceObjectKey,
                                    regionStatus: true
                                })
                            }
                        }
                        else {
                            // Region does not have data
                            if (severity && severity[0]) {
                                if (this.checkSeverityHasServiceData(reportData, serviceObjectKey, severity)) {
                                    // Severity has service data
                                    services.push({
                                        service: serviceObjectKey,
                                        regionStatus: false,
                                        severityStatus: true
                                    })
                                }
                                else {
                                    // Severity does not have service data
                                    services.push({
                                        service: serviceObjectKey,
                                        regionStatus: false,
                                        severityStatus: false
                                    })
                                }

                            }
                            else {
                                // No Severity
                                services.push({
                                    service: serviceObjectKey,
                                    regionStatus: false
                                })
                            }
                        }
                    }
                    else {
                        // No region
                        if (severity && severity[0]) {
                            if (this.checkSeverityHasServiceData(reportData, serviceObjectKey, severity)) {
                                // Severity has service data
                                services.push({
                                    service: serviceObjectKey,
                                    severityStatus: true
                                })
                            }
                            else {
                                // Severity does not have service data
                                services.push({
                                    service: serviceObjectKey,
                                    severityStatus: false
                                })
                            }

                        }
                        else {
                            // No severity
                            services.push({
                                service: serviceObjectKey
                            })
                        }
                    }
                }
            }
        }
        return services;
    }

    checkRegionHasSeverityData(reportData, region, severity) {
        for (let i = 0; i < severity.length; i++) {
            for (let serviceObjectKey in reportData) {
                for (let checkCategoryObjectKey in reportData[serviceObjectKey]) {
                    const regionsObject = reportData[serviceObjectKey][checkCategoryObjectKey].regions;
                    for (let j = 0; j < regionsObject[region].length; j++) {
                        if (regionsObject[region][j].severity === severity[i]) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    checkRegionHasServiceCheckCategoryData(reportData, region, service, checkCategory) {
        if (reportData[service][checkCategory].regions[region].length > 0) {
            return true;
        }
        return false;
    }

    checkRegionHasServiceSeverityData(reportData, region, service, severity) {
        for (let i = 0; i < severity.length; i++) {
            for (let checkCategoryObjectKey in reportData[service]) {
                const regionsObject = reportData[service][checkCategoryObjectKey].regions;
                for (let j = 0; j < regionsObject[region].length; j++) {
                    if (regionsObject[region][j].severity === severity[i]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    checkRegionHasServiceCheckCategorySeverityData(reportData, region, service, checkCategory, severity) {
        for (let i = 0; i < severity.length; i++) {
            for (let j = 0; j < reportData[service][checkCategory].regions[region].length; j++) {
                if (reportData[service][checkCategory].regions[region][j].severity === severity[i]) {
                    return true;
                }
            }
        }
        return false;
    }

    getRegions(reportData, service, checkCategory, severity) {
        console.log(service, checkCategory, severity)
        let regions = [];
        for (let i = 0; i < this.awsRegions.length; i++) {
            if (service) {
                if (this.checkRegionHasServiceData(reportData, service, this.awsRegions[i])) {
                    if (checkCategory) {
                        // Service, CheckCategory
                        if (this.checkRegionHasServiceCheckCategoryData(reportData, this.awsRegions[i], service, checkCategory)) {
                            if (severity && severity[0]) {
                                // Service, CheckCategory, Severity
                                if (this.checkRegionHasServiceCheckCategorySeverityData(reportData, this.awsRegions[i], service, checkCategory, severity)) {
                                    regions.push({
                                        region: this.awsRegions[i],
                                        serviceStatus: true,
                                        checkCategoryStatus: true,
                                        severityStatus: true
                                    })
                                }
                                else {
                                    regions.push({
                                        region: this.awsRegions[i],
                                        serviceStatus: true,
                                        checkCategoryStatus: true,
                                        severityStatus: false
                                    })
                                }
                            }
                            else {
                                // Service, CheckCategory, No Severity
                                if (reportData[service][checkCategory].regions[this.awsRegions[i]].length > 0) {
                                    regions.push({
                                        region: this.awsRegions[i],
                                        serviceStatus: true,
                                        checkCategoryStatus: true
                                    })
                                }
                            }
                        }
                        else {
                            regions.push({
                                region: this.awsRegions,
                                serviceStatus: true,
                                checkCategoryStatus: false
                            })
                        }
                    }
                    else {
                        // Service, No CheckCategory
                        if (severity && severity[0]) {
                            // Service, No CheckCategory, Severity
                            if (this.checkRegionHasServiceSeverityData(reportData, this.awsRegions[i], service, severity)) {
                                regions.push({
                                    region: this.awsRegions[i],
                                    serviceStatus: true,
                                    severityStatus: true
                                })
                            }
                            else {
                                regions.push({
                                    region: this.awsRegions[i],
                                    serviceStatus: true,
                                    severityStatus: false
                                })
                            }
                        }
                        else {
                            // Service, No CheckCategory, No Severity
                            regions.push({
                                region: this.awsRegions[i],
                                serviceStatus: true
                            })
                        }
                    }
                }
                else {
                    if (severity && severity[0]) {
                        if (this.checkRegionHasSeverityData(reportData, this.awsRegions[i], severity)) {
                            regions.push({
                                region: this.awsRegions[i],
                                serviceStatus: false,
                                severityStatus: true
                            })
                        }
                        else {
                            regions.push({
                                region: this.awsRegions[i],
                                serviceStatus: false,
                                severityStatus: false
                            })
                        }
                    }
                    else {
                        regions.push({
                            region: this.awsRegions[i],
                            serviceStatus: false
                        })
                    }
                }
            }
            else {
                if (severity && severity[0]) {
                    // Severity
                    if (this.checkRegionHasSeverityData(reportData, this.awsRegions[i], severity)) {
                        regions.push({
                            region: this.awsRegions[i],
                            severityStatus: true
                        })
                    }
                    else {
                        regions.push({
                            region: this.awsRegions[i],
                            severityStatus: false
                        })
                    }
                }
                else {
                    regions.push({
                        region: this.awsRegions[i]
                    })
                }
            }
        }
        return regions;
    }

    // Remove aws. from service name
    getServiceName(serviceName) {
        return serviceName.split('.')[1];
    }

    getServicesByFilteredReportData(filteredReportData) {
        let services = [];
        for (let serviceObjectKey in filteredReportData) {
            for (let checkCategoryObjectKey in filteredReportData[serviceObjectKey]) {
                const regionsObject = filteredReportData[serviceObjectKey][checkCategoryObjectKey].regions;
                for (let regionsObjectKey in regionsObject) {
                    if (regionsObject[regionsObjectKey].length > 0 && !this.checkHasData(this.getServiceName(serviceObjectKey), services)) {
                        services.push(this.getServiceName(serviceObjectKey));
                    }
                }
            }
        }
        return services;
    }

    /** 
     * Return check categories
     * based on service
    */
    // getServiceCheckCategories(data) {
    //     let checkCategories = [];
    //     for (let serviceObjectKey in data) {
    //         for (let checkCategoryObjectKey in data[serviceObjectKey]) {
    //             const checkCategoryObject = data[serviceObjectKey][checkCategoryObjectKey];
    //             if (this.checkServiceCheckCategoryHasData(checkCategoryObject)) {
    //                 checkCategories.push(this.replaceUnderscoreWithSpace(checkCategoryObjectKey));
    //             }
    //         }

    //     }
    //     return checkCategories;
    // }

    getServiceCheckCategoriesByFilteredReportData(filteredReportData) {
        let serviceCheckCategories = [];
        for (let serviceObjectKey in filteredReportData) {
            for (let checkCategoryObjectKey in filteredReportData[serviceObjectKey]) {
                serviceCheckCategories.push(this.replaceUnderscoreWithSpace(checkCategoryObjectKey));
            }
        }
        return serviceCheckCategories;
    }

    /** 
     * Return regions based on service and check category
    */
    getServiceRegions(data) {
        let regionsHaveData = [];
        for (let serviceObjectKey in data) {
            for (let checkCategoryKey in data[serviceObjectKey]) {
                for (let regionObjectKey in data[serviceObjectKey][checkCategoryKey].regions) {
                    if (data[serviceObjectKey][checkCategoryKey].regions[regionObjectKey].length >= 1) {
                        if (!this.checkHasData(regionObjectKey, regionsHaveData))
                            regionsHaveData.push(regionObjectKey);
                    }
                }
            }
        }
        // console.log(regionsHaveData)
        return regionsHaveData;
    }

    /************************************ check detail page end ***********************************************/


}