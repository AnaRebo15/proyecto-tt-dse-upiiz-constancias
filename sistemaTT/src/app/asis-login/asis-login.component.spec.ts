import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsisLoginComponent } from './asis-login.component';

describe('AsisLoginComponent', () => {
  let component: AsisLoginComponent;
  let fixture: ComponentFixture<AsisLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsisLoginComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AsisLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
