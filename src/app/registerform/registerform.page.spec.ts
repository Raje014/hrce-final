import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterformPage } from './registerform.page';

describe('RegisterformPage', () => {
  let component: RegisterformPage;
  let fixture: ComponentFixture<RegisterformPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterformPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
