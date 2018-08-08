import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class CloudReportService {

    scanReportData;

    constructor(private http: HttpClient) { }

    private fetchScanReportData() {
        return this.http.get('assets/data.json');
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

    checkServiceHasData(serviceObject) {
        for (let checkCategoryObjectKey in serviceObject) {
            const regionsObject = serviceObject[checkCategoryObjectKey]['regions'];
            for (let regionsObjectKey in regionsObject) {
                if (regionsObject[regionsObjectKey].length >= 1) {
                    return true;
                }
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

    checkHasData(data, dataArray) {
        for (let i = 0; i < dataArray.length; i++) {
            if (data === dataArray[i]) {
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
        else if (service) {
            const selectedRegion = localStorage.getItem('awsRegion');
            const regionsHaveData = this.getRegionsHaveData(service, data);
            // console.log(selectedRegion, regionsHaveData)
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

    getCheckDetailData(data, service?: string, checkCategory?: string, region?: string) {
        if (checkCategory && checkCategory !== 'all' && checkCategory !== 'null' && checkCategory !== 'undefined')
            checkCategory = this.replaceSpaceWithUnderscore(checkCategory.toLowerCase());
        console.log(service, typeof checkCategory, typeof region)
        let filterredData = data;
        if (service && service !== 'null' && service !== 'undefined') {
            filterredData = {
                [service]: data[service]
            }
            if (checkCategory && checkCategory !== 'all' && checkCategory !== 'null' && checkCategory !== 'undefined') {
                filterredData[service] = {
                    [checkCategory]: filterredData[service][checkCategory]
                }
            }
            if (region && region !== 'all' && region !== 'null' && region !== 'undefined') {
                for (let checkCategoryIndex in filterredData[service]) {
                    if (filterredData[service][checkCategoryIndex].regions[region]) {
                        filterredData[service][checkCategoryIndex].regions = {
                            [region]: filterredData[service][checkCategoryIndex].regions[region]
                        }
                    }
                }
            }
        } else if (region && region !== 'all' && region !== 'null' && region !== 'undefined') {
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
        return filterredData;
    }

    /** 
     * Return services which are 
     * present in report data and have data
     */
    getServices(data) {
        let services = [];
        for (let serviceObjectKey in data) {
            if (this.checkServiceHasData(data[serviceObjectKey])) {
                services.push(serviceObjectKey.split('.')[1]);
            }
        }
        return services;
    }

    /** 
     * Return check categories
     * based on service
    */
    getServiceCheckCategories(data) {
        let checkCategories = [];
        for (let serviceObjectKey in data) {
            for (let checkCategoryObjectKey in data[serviceObjectKey]) {
                const checkCategoryObject = data[serviceObjectKey][checkCategoryObjectKey];
                if (this.checkServiceCheckCategoryHasData(checkCategoryObject)) {
                    checkCategories.push(this.replaceUnderscoreWithSpace(checkCategoryObjectKey));
                }
            }

        }
        return checkCategories;
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