import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardsPowerBiPage } from './dashboards-power-bi.page';

describe('DashboardsPowerBiPage', () => {
  let component: DashboardsPowerBiPage;
  let fixture: ComponentFixture<DashboardsPowerBiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardsPowerBiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
