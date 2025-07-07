import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimuladorServicoPage } from './simulador-servico.page';

describe('SimuladorServicoPage', () => {
  let component: SimuladorServicoPage;
  let fixture: ComponentFixture<SimuladorServicoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SimuladorServicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
