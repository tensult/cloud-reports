import { Component, OnInit, ViewChild } from '@angular/core';
import { CloudReportService } from '../report.service'
import { ActivatedRoute, Router } from '@angular/router';
import { MatSort, MatPaginator, MatTableDataSource } from '@angular/material';

@Component({
    selector: 'app-cloudreportcheckdetail',
    templateUrl: 'component.html',
    styleUrls: ['component.scss']
})
export class CloudReportCheckDetailComponent implements OnInit {

    checksDetailData: object[];
    displayedColumns = ['resourceName', 'resourceValue', 'region', 'message', 'severity'];
    dataSource;
    urlData: object = {};
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    resultLength = 0;
    services: string[];
    selectedService: string;
    serviceCheckCategories: string[];
    selectedServiceCheckCategory: string;
    serviceCheckCategoryRegions: string[];
    selectedServiceCheckCategoryRegion: string;
    hasNoRegions: boolean = true;

    scanReportData: Object;

    constructor(
        private cloudReportService: CloudReportService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadCheckDetailPageData();
    }

    loadCheckDetailPageData() {
        this.route.params.subscribe((params) => {
            this.urlData['checkCategory'] = params['checkCategory'];
            this.urlData['region'] = params['region'];
            this.urlData['service'] = params['service'];
            this.cloudReportService.getScanReportData()
                .subscribe((data) => {
                    this.scanReportData = data;
                    this.services = this.cloudReportService.getServices(data);
                    this.selectedService = this.urlData['service'];
                    this.serviceCheckCategories = this.cloudReportService.getServiceCheckCategories('aws.' + this.selectedService, data);
                    this.selectedServiceCheckCategory = this.urlData['checkCategory'];
                    this.serviceCheckCategoryRegions = this.cloudReportService.getServiceCheckCategoryRegions('aws.' + this.selectedService, this.selectedServiceCheckCategory, data);
                    this.selectedServiceCheckCategoryRegion = this.urlData['region'];

                    let checkDetailData = this.cloudReportService.getCheckDetailData(data, 'aws.' + this.urlData['service'], this.urlData['checkCategory'], this.urlData['region']);
                    // console.log(checkDetailData);
                    checkDetailData = checkDetailData.map((eachData) => {
                        eachData['resourceSummaryName'] = eachData['resourceSummary']['name'];
                        eachData['resourceSummaryValue'] = eachData['resourceSummary']['value'];
                        eachData['message'] = eachData['message'];
                        eachData['severity'] = eachData['severity'];
                        return eachData;
                    })
                    this.resultLength = checkDetailData.length;
                    this.dataSource = new MatTableDataSource(checkDetailData);
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;

                }, (error) => {
                    console.log(error);
                })
        })
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    fetchServiceCheckCateroies() {
        this.serviceCheckCategories = this.cloudReportService.getServiceCheckCategories('aws.' + this.selectedService, this.scanReportData)
        this.serviceCheckCategoryRegions = [];
        this.selectedServiceCheckCategory = '';
        this.reload();
    }

    fetchServiceCheckCateroyRegions() {
        this.selectedServiceCheckCategoryRegion = undefined;
        this.serviceCheckCategoryRegions = this.cloudReportService.getServiceCheckCategoryRegions('aws.' + this.selectedService, this.selectedServiceCheckCategory, this.scanReportData);
        this.reload();
    }

    reload() {
        // if (!this.selectedService || !this.selectedServiceCheckCategory || !this.selectedServiceCheckCategoryRegion) {
        //     console.log('something is missing in selectedService = ' + this.selectedService + ' or selectedServiceCheckCategory = ' + this.selectedServiceCheckCategory + ' or selectedServiceCheckCategoryRegion =' + this.selectedServiceCheckCategoryRegion);
        //     return;
        // }
        console.log('all data is present, selectedService = ' + this.selectedService + ' or selectedServiceCheckCategory = ' + this.selectedServiceCheckCategory + ' or selectedServiceCheckCategoryRegion =' + this.selectedServiceCheckCategoryRegion + ' and reloading page');
        this.router.navigate(['/report/checkDetail', {
            checkCategory: this.selectedServiceCheckCategory,
            region: this.selectedServiceCheckCategoryRegion,
            service: this.selectedService
        }])
    }

    goToServiceDashboard() {
        this.router.navigate(['/report/checkCategory', this.selectedService])
    }

}