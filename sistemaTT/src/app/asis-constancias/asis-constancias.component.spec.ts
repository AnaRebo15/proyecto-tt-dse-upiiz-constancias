import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsisConstanciasComponent } from './asis-constancias.component';

describe('AsisConstanciasComponent', () => {
  let component: AsisConstanciasComponent;
  let fixture: ComponentFixture<AsisConstanciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsisConstanciasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AsisConstanciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
