import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepLoginComponent } from './dep-login.component';

describe('DepLoginComponent', () => {
  let component: DepLoginComponent;
  let fixture: ComponentFixture<DepLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepLoginComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DepLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
