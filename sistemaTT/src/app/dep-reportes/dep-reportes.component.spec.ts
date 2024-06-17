import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepReportesComponent } from './dep-reportes.component';

describe('DepReportesComponent', () => {
  let component: DepReportesComponent;
  let fixture: ComponentFixture<DepReportesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepReportesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DepReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
