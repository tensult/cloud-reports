import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoDataToShowComponent } from './no-data-to-show.component';

describe('NoDataToShowComponent', () => {
  let component: NoDataToShowComponent;
  let fixture: ComponentFixture<NoDataToShowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoDataToShowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoDataToShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
