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
            { path: 'dashboard', component: CloudReportDashboardComponent },
            { path: 'checkCategory/:service', component: CloudReportCheckCategoryComponent },
            { path: 'checkDetail', component: CloudReportCheckDetailComponent }
        ]),
        HttpClientModule
    ],
    providers: [CloudReportService]
})
export class ReportModule { }