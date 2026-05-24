import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TempleLocationPage } from './temple-location.page';

describe('TempleLocationPage', () => {
  let component: TempleLocationPage;
  let fixture: ComponentFixture<TempleLocationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TempleLocationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
