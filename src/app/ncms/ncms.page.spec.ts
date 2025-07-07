import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NcmsPage } from './ncms.page';

describe('NcmsPage', () => {
  let component: NcmsPage;
  let fixture: ComponentFixture<NcmsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NcmsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
