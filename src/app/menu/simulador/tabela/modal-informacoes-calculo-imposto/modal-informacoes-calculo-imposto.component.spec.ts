import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalInformacoesCalculoImpostoComponent } from './modal-informacoes-calculo-imposto.component';

describe('ModalInformacoesCalculoImpostoComponent', () => {
  let component: ModalInformacoesCalculoImpostoComponent;
  let fixture: ComponentFixture<ModalInformacoesCalculoImpostoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalInformacoesCalculoImpostoComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalInformacoesCalculoImpostoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
