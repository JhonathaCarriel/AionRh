import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastronovousuarioPage } from './cadastronovousuario.page';

describe('CadastronovousuarioPage', () => {
  let component: CadastronovousuarioPage;
  let fixture: ComponentFixture<CadastronovousuarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastronovousuarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
