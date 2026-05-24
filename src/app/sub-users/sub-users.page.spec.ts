import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubUsersPage } from './sub-users.page';

describe('SubUsersPage', () => {
  let component: SubUsersPage;
  let fixture: ComponentFixture<SubUsersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SubUsersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
