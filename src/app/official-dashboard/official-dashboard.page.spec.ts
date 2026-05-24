import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfficialDashboardPage } from './official-dashboard.page';

describe('OfficialDashboardPage', () => {
  let component: OfficialDashboardPage;
  let fixture: ComponentFixture<OfficialDashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficialDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
