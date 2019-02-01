import { ArrayUtil } from './../../../utils/array';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CloudReportService } from '../report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSort, MatPaginator, MatTableDataSource } from '@angular/material';

@Component({
    selector: 'app-cloud-report-check-detail',
    templateUrl: 'component.html',
    styleUrls: ['component.scss']
})
export class CloudReportCheckDetailComponent implements OnInit {

    displayedColumns = ['service', 'checkCategory', 'pillar', 'region', 'resourceName', 'resourceValue', 'message', 'severity', 'action'];
    dataSource;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    resultLength = 0;
    services: string[];
    selectedService: string;
    serviceCheckCategories: string[];
    selectedServiceCheckCategory: string;
    regions: string[];
    selectedRegion: string;
    hasNoRegions = true;
    selectedSeverity: string[];
    selectedPillar: string[];
    tableData: any[];
    scanReportData: Object;
    removable = true;

    filterSelections: Object[];

    constructor(
        private cloudReportService: CloudReportService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadCheckDetailPageData();
    }

    private getServiceKey(provider = 'aws') {
        return this.selectedService ? provider + '.' + this.selectedService : undefined;
    }

    loadCheckDetailPageData() {
        this.route.queryParams.subscribe((urlData) => {
            this.cloudReportService.getScanReportData()
                .subscribe((data) => {
                    // this.loadFilterSelection();
                    this.scanReportData = data;
                    this.services = this.cloudReportService.getServices(data);
                    this.selectedSeverity = ArrayUtil.toArray(urlData['severity']);
                    this.selectedPillar = ArrayUtil.toArray(urlData['pillar']);
                    this.selectedService = urlData['service'];
                    const serviceKey = this.getServiceKey();
                    if (this.selectedService) {
                        this.serviceCheckCategories = this.cloudReportService.getServiceCheckCategories(
                            this.cloudReportService.getCheckDetailData(data, serviceKey));
                    }
                    this.selectedServiceCheckCategory = urlData['checkCategory'] === 'null' ||
                        urlData['checkCategory'] === 'undefined' ? 'all' : urlData['checkCategory'];
                    this.regions = this.cloudReportService.getAllRegions('aws');
                    this.selectedRegion = urlData['region'] === 'null' || urlData['region'] === 'undefined' ? 'all' : urlData['region'];
                    if (this.regions.length === 1) {
                        this.selectedRegion = this.regions[0];
                    }
                    const filteredData = this.cloudReportService.getCheckDetailData(data, serviceKey,
                        this.selectedServiceCheckCategory, this.selectedRegion,
                        this.selectedSeverity, this.selectedPillar);
                    this.tableData = this.makeTableData(filteredData);
                    this.dataSource = new MatTableDataSource(this.tableData);
                    this.resultLength = this.tableData.length;
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                }, (error) => {
                    console.log(error);
                });
        });
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    fetchServiceCheckCategories() {
        this.selectedServiceCheckCategory = undefined;
        this.serviceCheckCategories = this.cloudReportService.getServiceCheckCategories(
            this.cloudReportService.getCheckDetailData(this.scanReportData, this.getServiceKey()));
        this.reload();
    }

    fetchServiceCheckCategoryRegions() {
        this.reload();
    }

    reload() {
        if (!ArrayUtil.isNotBlank(this.selectedSeverity)) {
            this.selectedSeverity = undefined;
        }
        if (!ArrayUtil.isNotBlank(this.selectedPillar)) {
            this.selectedPillar = undefined;
        }
        this.router.navigate(['/report/checkDetail'], {
            queryParams: {
                checkCategory: this.selectedServiceCheckCategory,
                region: this.selectedRegion,
                service: this.selectedService,
                severity: this.selectedSeverity,
                pillar: this.selectedPillar,
            }
        });
    }

    goToServiceDashboard() {
        this.router.navigate(['/report/checkCategory', this.selectedService]);
    }

    private makeTableData(filteredDataObject: any) {
        const tableData = [];
        if (filteredDataObject && typeof filteredDataObject === 'object') {
            for (const serviceObjectKey in filteredDataObject) {
                for (const checkCategoryObjectKey in filteredDataObject[serviceObjectKey]) {
                    const regionsObject = filteredDataObject[serviceObjectKey][checkCategoryObjectKey].regions;
                    for (const regionsObjectKey in regionsObject) {
                        for (let i = 0; i < regionsObject[regionsObjectKey].length; i++) {
                            regionsObject[regionsObjectKey][i]['service'] = serviceObjectKey.split('.')[1];
                            regionsObject[regionsObjectKey][i]['pillar'] =
                                filteredDataObject[serviceObjectKey][checkCategoryObjectKey].type;
                            regionsObject[regionsObjectKey][i]['checkCategory'] = checkCategoryObjectKey;
                            regionsObject[regionsObjectKey][i]['region'] = regionsObjectKey;
                            regionsObject[regionsObjectKey][i]['recommendation'] =
                                filteredDataObject[serviceObjectKey][checkCategoryObjectKey].recommendation;
                            tableData.push(regionsObject[regionsObjectKey][i]);
                        }
                    }
                }
            }
        }
        return tableData;
    }
}
