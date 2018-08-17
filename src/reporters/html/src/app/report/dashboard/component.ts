import { Component, OnInit, ViewChild } from '@angular/core';
import { CloudReportService } from '../report.service'
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-cloud-report-dashboard',
  templateUrl: 'component.html',
  styleUrls: ['component.scss']
})
export class CloudReportDashboardComponent implements OnInit {

  displayedColumns: string[] = ['services', 'noOfChecks', 'noOfFailures'];
  dataSource;
  scanReportData: Object;

  constructor(private cloudReportService: CloudReportService, private router: Router) { }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.cloudReportService.getScanReportData()
      .subscribe((data) => {
        const dashboardData = this.cloudReportService.getDashboardData(data);
        this.dataSource = new MatTableDataSource(dashboardData);
      }, (error) => {
        console.log(error);
      }
      )
  }

  goToService(element) {
    this.router.navigate(['report/checkCategory', element.service]);
  }


}