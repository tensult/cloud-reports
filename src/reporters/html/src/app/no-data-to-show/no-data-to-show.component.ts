import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-no-data-to-show',
  templateUrl: './no-data-to-show.component.html',
  styleUrls: ['./no-data-to-show.component.css']
})
export class NoDataToShowComponent implements OnInit {

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<NoDataToShowComponent>
  ) { }

  ngOnInit() {
    const callback = () => {
      this.dialogRef.close();
      this.router.navigate(['/']);
    };
    setTimeout(callback, 3000);
  }

}
