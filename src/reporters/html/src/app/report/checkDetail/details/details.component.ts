import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {

  service: string = sessionStorage.getItem('services');
  checkCategory: string = sessionStorage.getItem('checkCategorys');
  pillar: string = sessionStorage.getItem('pillars');
  region: string = sessionStorage.getItem('regions');
  name: string = sessionStorage.getItem('names');
  value: string = sessionStorage.getItem('values');
  severity: string = sessionStorage.getItem('severitys');
  message: string = sessionStorage.getItem('messages');
  recommendation: string = sessionStorage.getItem('recommendations');


  constructor() { }

  ngOnInit() {
  }

}
