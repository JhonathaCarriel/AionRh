import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalInformacoesNcmComponent } from './modal-informacoes-ncm.component';

describe('ModalInformacoesNcmComponent', () => {
  let component: ModalInformacoesNcmComponent;
  let fixture: ComponentFixture<ModalInformacoesNcmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalInformacoesNcmComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalInformacoesNcmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
