import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsisEventosComponent } from './asis-eventos.component';

describe('AsisEventosComponent', () => {
  let component: AsisEventosComponent;
  let fixture: ComponentFixture<AsisEventosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsisEventosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AsisEventosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
