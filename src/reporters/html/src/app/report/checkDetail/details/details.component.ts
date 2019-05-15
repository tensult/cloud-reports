import { Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {

  
  // sessionStorage.setItem('services',element.service);
  // sessionStorage.setItem('checkCategorys',element.checkCategory);
  // sessionStorage.setItem('pillars',element.pillar);
  // sessionStorage.setItem('regions',element.region);
  // sessionStorage.setItem('names',element.resourceSummary.name);
  // sessionStorage.setItem('values',element.resourceSummary.value);
  // sessionStorage.setItem('severitys',element.severity);
  // sessionStorage.setItem('messages',element.message);
  // sessionStorage.setItem('recommendations',element.recommendation);

  service:string = sessionStorage.getItem('services');
  checkCategory:string = sessionStorage.getItem('checkCategorys');
  pillar:string = sessionStorage.getItem('pillars');
  region:string = sessionStorage.getItem('regions');
  name:string = sessionStorage.getItem('names');
  value:string = sessionStorage.getItem('values');
  severity:string = sessionStorage.getItem('severitys');
  message:string = sessionStorage.getItem('messages');
  recommendation:string = sessionStorage.getItem('recommendations');


  constructor() { }

  ngOnInit() {
  }

}
