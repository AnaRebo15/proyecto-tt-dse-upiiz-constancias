import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepAsistenciaComponent } from './dep-asistencia.component';

describe('DepAsistenciaComponent', () => {
  let component: DepAsistenciaComponent;
  let fixture: ComponentFixture<DepAsistenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepAsistenciaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DepAsistenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
