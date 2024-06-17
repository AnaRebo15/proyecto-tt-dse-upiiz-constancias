import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsisInfoUsuarioComponent } from './asis-info-usuario.component';

describe('AsisInfoUsuarioComponent', () => {
  let component: AsisInfoUsuarioComponent;
  let fixture: ComponentFixture<AsisInfoUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsisInfoUsuarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AsisInfoUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
