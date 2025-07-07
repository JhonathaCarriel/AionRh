import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  standalone: true,
  imports: [IonicModule, CommonModule],
  selector: 'app-modal-informacoes-calculo-despesas',
  templateUrl: './modal-informacoes-calculo-despesas.component.html',
  styleUrls: ['./modal-informacoes-calculo-despesas.component.scss'],
})
export class ModalInformacoesCalculoDespesasComponent  implements OnInit {
  @Input() item: any;
  @Input() calculoVlrDespesas: number = 0;
  @Input() calculoDescontoVlrVendaTotal: number = 0;
  


  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {}


  closeModal() {
    this.modalController.dismiss();
  }
  
}
