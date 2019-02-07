
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { PageNotFound } from './page-not-found.component';
import { ReportModule } from './report/report.module';


@NgModule({
  declarations: [
    AppComponent,
    PageNotFound,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReportModule,
    RouterModule.forRoot([
      { path: '', redirectTo: '/report/dashboard', pathMatch: 'full' },
      { path: '**', component: PageNotFound }
    ], { useHash: true }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
