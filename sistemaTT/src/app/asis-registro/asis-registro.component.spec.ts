import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsisRegistroComponent } from './asis-registro.component';

describe('AsisRegistroComponent', () => {
  let component: AsisRegistroComponent;
  let fixture: ComponentFixture<AsisRegistroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsisRegistroComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AsisRegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
