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
    ];


    constructor(private http: HttpClient) { }

    private fetchScanReportData() {
        return this.http.get('assets/data.json');
    }

    getAllRegions(provider) {
        if (provider === 'aws') {
            return this.awsRegions;
        }
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

        const dashboardData: object[] = [];
        for (const serviceObjectKey in data) {  // each service
            const serviceData: object = {};
            serviceData['service'] = serviceObjectKey.split('.')[1];
            serviceData['noOfChecks'] = 0;
            serviceData['noOfFailures'] = 0;
            for (const checkObjectKey in data[serviceObjectKey]) {
                if (data[serviceObjectKey][checkObjectKey].regions.hasOwnProperty('global')) {
                    const resources = data[serviceObjectKey][checkObjectKey].regions.global;
                    for (let i = 0; i < resources.length; i++) {
                        const severity = resources[i].severity;
                        serviceData['noOfChecks']++;
                        if (severity === 'Warning' || severity === 'Failure') {
                            serviceData['noOfFailures']++;
                        }
                    }
                } else {
                    for (const region in data[serviceObjectKey][checkObjectKey].regions) {
                        const resources = data[serviceObjectKey][checkObjectKey].regions[region];
                        for (let i = 0; i < resources.length; i++) {
                            const severity = resources[i].severity;
                            serviceData['noOfChecks']++;
                            if (severity === 'Warning' || severity === 'Failure') {
                                serviceData['noOfFailures']++;
                            }
                        }
                    }
                }
            }
            if (serviceData['noOfChecks'] === 0) {
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
        for (const regionsObjectKey in regionsObject) {
            if (regionsObject[regionsObjectKey].length >= 1) {
                return true;
            }
        }
        return false;
    }

    checkServiceHasData(serviceObject) {
        for (const checkCategoryObjectKey in serviceObject) {
            const regionsObject = serviceObject[checkCategoryObjectKey]['regions'];
            for (const regionsObjectKey in regionsObject) {
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
        const checkCategoryData: object[] = [];
        const regionsHaveData = [];
        for (const serviceObjectKey in data) {
            if (serviceObjectKey === service) {
                for (const checkCategoryObjectKey in data[serviceObjectKey]) {
                    const serviceData: object = {};
                    serviceData['badConditionCount'] = 0;
                    serviceData['goodConditionCount'] = 0;
                    serviceData['checkCategoryName'] = this.replaceUnderscoreWithSpace(checkCategoryObjectKey);
                    const regionsObject = data[serviceObjectKey][checkCategoryObjectKey]['regions'];
                    if (regionsObject.hasOwnProperty('global')) {
                        if (regionsObject.global.length < 1) {
                            continue;
                        } else if (regionsObject.global.length > 1) {
                            if (!this.checkHasData('global', regionsHaveData)) {
                                regionsHaveData.push('global');
                                serviceData['regionsHaveData'] = regionsHaveData;
                            }
                            for (let i = 0; i < regionsObject.global.length; i++) {
                                const resourceObject = regionsObject.global[i];
                                const severity = resourceObject.severity;
                                if (resourceObject.severity === 'Good') {
                                    serviceData['goodConditionCount']++;
                                } else if (severity === 'Warning' || severity === 'Failure') {
                                    serviceData['badConditionCount']++;
                                }
                            }
                        }
                    } else if (region === 'all') {
                        for (const regionsObjectKey in regionsObject) {
                            const regionData = regionsObject[regionsObjectKey];
                            if (regionData.length < 1) {
                                continue;
                            } else if (regionData.length >= 1) {
                                if (!this.checkHasData(regionsObjectKey, regionsHaveData)) {
                                    regionsHaveData.push(regionsObjectKey);
                                }
                                for (let i = 0; i < regionData.length; i++) {
                                    const resourceObject = regionData[i];
                                    const severity = resourceObject.severity;
                                    if (resourceObject.severity === 'Good') {
                                        serviceData['goodConditionCount']++;
                                    } else if (severity === 'Warning' || severity === 'Failure') {
                                        serviceData['badConditionCount']++;
                                    }
                                }
                            }
                        }
                        serviceData['regionsHaveData'] = regionsHaveData;
                    } else {
                        for (const regionsObjectKey in regionsObject) {
                            if (regionsObjectKey === region) {
                                const regionData = regionsObject[regionsObjectKey];
                                if (regionData.length < 1) {
                                    continue;
                                } else if (regionData.length >= 1) {
                                    for (let i = 0; i < regionData.length; i++) {
                                        const resourceObject = regionData[i];
                                        const severity = resourceObject.severity;
                                        if (resourceObject.severity === 'Good') {
                                            serviceData['goodConditionCount']++;
                                        } else if (severity === 'Warning' || severity === 'Failure') {
                                            serviceData['badConditionCount']++;
                                        }
                                    }
                                    if (!this.checkHasData(region, regionsHaveData)) {
                                        regionsHaveData.push(region);
                                    }
                                }
                            }
                        }
                        serviceData['regionsHaveData'] = regionsHaveData;
                    }
                    if (serviceData['badConditionCount'] === 0 && serviceData['goodConditionCount'] === 0) {
                        continue;
                    }
                    checkCategoryData.push(serviceData);
                }
            }
        }
        return checkCategoryData;
    }

    getRegionsWithData(data, service) {
        const regionsHaveData = [];
        for (const serviceObjectKey in data) {
            if (service && serviceObjectKey !== service) {
                continue;
            }
            for (const checkCategoryKey in data[serviceObjectKey]) {
                for (const regionObjectKey in data[serviceObjectKey][checkCategoryKey].regions) {
                    if (data[serviceObjectKey][checkCategoryKey].regions[regionObjectKey].length >= 1) {
                        if (!this.checkHasData(regionObjectKey, regionsHaveData)) {
                            regionsHaveData.push(regionObjectKey);
                        }
                    }
                }
            }

        }
        return regionsHaveData;
    }

    manageRegion(region?, service?, data?) {
        if (!region && !localStorage.getItem('awsRegion')) {
            localStorage.setItem('awsRegion', 'all');
        } else if (region) {
            localStorage.setItem('awsRegion', region);
        } else if (service && !region && data) {
            const selectedRegion = localStorage.getItem('awsRegion');
            const regionsHaveData = this.getRegionsWithData(data, service);
            for (let i = 0; i < regionsHaveData.length; i++) {
                if (selectedRegion === regionsHaveData[i]) {
                    return localStorage.getItem('awsRegion');
                }
            }
            localStorage.setItem('awsRegion', 'all');
        }
        return localStorage.getItem('awsRegion');
    }


    /************************************ check detail page start ***********************************************/

    getCheckDetailData(data,
        service?: string,
        checkCategory?: string,
        region?: string,
        severities?: string[],
        pillars?: string[]) {

        let filterredData = data;
        if (ArrayUtil.isNotBlank(service)) {
            filterredData = {
                [service]: data[service]
            };
            if (ArrayUtil.isNotBlank(checkCategory)) {
                checkCategory = this.replaceSpaceWithUnderscore(checkCategory.toLowerCase());
                filterredData[service] = {
                    [checkCategory]: filterredData[service][checkCategory]
                };
            }
        }

        if (ArrayUtil.isNotBlank(pillars)) {
            for (const serviceIndex in filterredData) {
                for (const checkCategoryIndex in filterredData[serviceIndex]) {
                    if (!pillars.includes(filterredData[serviceIndex][checkCategoryIndex].type)) {
                        delete filterredData[serviceIndex][checkCategoryIndex];
                    }
                }
            }
        }

        if (ArrayUtil.isNotBlank(region)) {
            for (const serviceIndex in filterredData) {
                for (const checkCategoryIndex in filterredData[serviceIndex]) {
                    if (filterredData[serviceIndex][checkCategoryIndex].regions[region]) {
                        filterredData[serviceIndex][checkCategoryIndex].regions = {
                            [region]: filterredData[serviceIndex][checkCategoryIndex].regions[region]
                        };
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
        const services = [];
        for (const serviceObjectKey in data) {
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
        const checkCategories = [];
        for (const serviceObjectKey in data) {
            for (const checkCategoryObjectKey in data[serviceObjectKey]) {
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
        const regionsHaveData = [];
        for (const serviceObjectKey in data) {
            for (const checkCategoryKey in data[serviceObjectKey]) {
                for (const regionObjectKey in data[serviceObjectKey][checkCategoryKey].regions) {
                    if (data[serviceObjectKey][checkCategoryKey].regions[regionObjectKey].length >= 1) {
                        if (!this.checkHasData(regionObjectKey, regionsHaveData)) {
                            regionsHaveData.push(regionObjectKey);
                        }
                    }
                }
            }
        }
        return regionsHaveData;
    }

    storeFilterSelectionData(data) {
        let storedFilterSelection = [];
        storedFilterSelection = JSON.parse(localStorage.getItem('filterSelection'));
        if (!storedFilterSelection || storedFilterSelection.length < 1) {
            storedFilterSelection = [];
        }
        storedFilterSelection.push(data);
        localStorage.setItem('filterSelection', JSON.stringify(storedFilterSelection));
    }

    getFilterSelectionData() {
        const storedFilterSelection = JSON.parse(localStorage.getItem('filterSelection'));
        if (storedFilterSelection && storedFilterSelection.length > 0) {
            return storedFilterSelection;
        }
    }

    checkSameFilterSelectionData(storedFilterSelectionData: Object[], newFilterSelectionData: Object) {
        for (let i = 0; i < storedFilterSelectionData.length; i++) {

        }
    }

    /************************************ check detail page end ***********************************************/


}
