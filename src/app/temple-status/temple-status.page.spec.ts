import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TempleStatusPage } from './temple-status.page';

describe('TempleStatusPage', () => {
  let component: TempleStatusPage;
  let fixture: ComponentFixture<TempleStatusPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TempleStatusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
