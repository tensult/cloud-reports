import { Component, OnInit, ViewChild } from '@angular/core';
import { CloudReportService } from '../report.service'
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-cloud-report-dashboard',
  templateUrl: 'component.html',
  styleUrls: ['component.scss']
})
export class CloudReportDashboardComponent implements OnInit {

  displayedColumns: string[] = ['services', 'noOfChecks', 'noOfFailures', 'action'];
  dataSource;
  scanReportData: Object;

  constructor(private cloudReportService: CloudReportService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.route.queryParams.subscribe((urldata) => {
      const _urldata = urldata['urldata'];
      localStorage.setItem('urldata', _urldata);
      this.cloudReportService.getScanReportData()
        .subscribe((data) => {
          const dashboardData = this.cloudReportService.getDashboardData(data);
          this.dataSource = new MatTableDataSource(dashboardData);
        }, (error) => {
          alert('Some error has occured. We are closing tab. Please try again..')
          window.close();
        }
        )
    })
  }

  goToService(element) {
    this.router.navigate(['checkCategory', element.service]);
  }


}