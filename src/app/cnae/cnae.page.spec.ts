import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CnaePage } from './cnae.page';

describe('CnaePage', () => {
  let component: CnaePage;
  let fixture: ComponentFixture<CnaePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CnaePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
