import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BotaoFlutuanteComponent } from './botao-flutuante.component';

describe('BotaoFlutuanteComponent', () => {
  let component: BotaoFlutuanteComponent;
  let fixture: ComponentFixture<BotaoFlutuanteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BotaoFlutuanteComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BotaoFlutuanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
