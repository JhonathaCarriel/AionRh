import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalInformacoesCalculoIcmsstComponent } from './modal-informacoes-calculo-icmsst.component';

describe('ModalInformacoesCalculoIcmsstComponent', () => {
  let component: ModalInformacoesCalculoIcmsstComponent;
  let fixture: ComponentFixture<ModalInformacoesCalculoIcmsstComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalInformacoesCalculoIcmsstComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalInformacoesCalculoIcmsstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
