import { CloudReportCheckDetailComponent } from './checkDetail/component';
import { CloudReportCheckCategoryComponent } from './checkCategory/component';
import { CloudReportService } from './report.service';
import { CloudReportDashboardComponent } from './dashboard/component';
import { NgModule } from "@angular/core";
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '../../../node_modules/@angular/common';
import {
    MatSelectModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
    MatChipsModule,
    MatIconModule
} from '@angular/material';

@NgModule({
    declarations: [
        CloudReportDashboardComponent,
        CloudReportCheckCategoryComponent,
        CloudReportCheckDetailComponent
    ],
    imports: [
        CommonModule,
        MatSelectModule,
        MatSelectModule,
        MatTableModule,
        MatCardModule,
        MatButtonModule,
        MatToolbarModule,
        MatPaginatorModule,
        MatInputModule,
        MatMenuModule,
        MatTooltipModule,
        MatIconModule,
        MatChipsModule,
        RouterModule.forChild([
            { path: 'report/dashboard', component: CloudReportDashboardComponent },
            { path: 'report/checkCategory/:service', component: CloudReportCheckCategoryComponent },
            { path: 'report/checkDetail', component: CloudReportCheckDetailComponent }
        ]),
        HttpClientModule
    ],
    providers: [CloudReportService]
})
export class ReportModule { }