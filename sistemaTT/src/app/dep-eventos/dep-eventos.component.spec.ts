import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepEventosComponent } from './dep-eventos.component';

describe('DepEventosComponent', () => {
  let component: DepEventosComponent;
  let fixture: ComponentFixture<DepEventosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepEventosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DepEventosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
