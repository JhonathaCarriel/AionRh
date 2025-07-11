import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportarPlanilhaPage } from './importar-planilha.page';

describe('ImportarPlanilhaPage', () => {
  let component: ImportarPlanilhaPage;
  let fixture: ComponentFixture<ImportarPlanilhaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportarPlanilhaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
