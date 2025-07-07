import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalInformacoesCalculoDespesasComponent } from './modal-informacoes-calculo-despesas.component';

describe('ModalInformacoesCalculoDespesasComponent', () => {
  let component: ModalInformacoesCalculoDespesasComponent;
  let fixture: ComponentFixture<ModalInformacoesCalculoDespesasComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalInformacoesCalculoDespesasComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalInformacoesCalculoDespesasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
