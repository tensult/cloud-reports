import { CloudReportCheckDetailComponent } from './checkDetail/component';
import { CloudReportCheckCategoryComponent } from './checkCategory/component';
import { CloudReportService } from './report.service';
import { CloudReportDashboardComponent } from './dashboard/component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '../../../node_modules/@angular/common';
import { NoDataToShowComponent } from '../no-data-to-show/no-data-to-show.component';

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
    MatIconModule,
    MatDialogModule
} from '@angular/material';
import { DetailsComponent } from './checkDetail/details/details.component';

@NgModule({
    declarations: [
        CloudReportDashboardComponent,
        CloudReportCheckCategoryComponent,
        CloudReportCheckDetailComponent,
        NoDataToShowComponent,
        DetailsComponent
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
        MatDialogModule,
        RouterModule.forChild([
            { path: 'report/dashboard', component: CloudReportDashboardComponent },
            { path: 'report/checkCategory/:service', component: CloudReportCheckCategoryComponent },
            { path: 'report/checkDetail', component: CloudReportCheckDetailComponent },
            { path: 'report/checkDetail/details', component: DetailsComponent}
        ]),
        HttpClientModule
    ],
    providers: [CloudReportService],
    entryComponents: [NoDataToShowComponent]
})
export class ReportModule { }
