import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimuladorProdutosPage } from './simulador-produtos.page';

describe('SimuladorProdutosPage', () => {
  let component: SimuladorProdutosPage;
  let fixture: ComponentFixture<SimuladorProdutosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SimuladorProdutosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
