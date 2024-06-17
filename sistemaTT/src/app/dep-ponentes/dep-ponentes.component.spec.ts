import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepPonentesComponent } from './dep-ponentes.component';

describe('DepPonentesComponent', () => {
  let component: DepPonentesComponent;
  let fixture: ComponentFixture<DepPonentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepPonentesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DepPonentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
