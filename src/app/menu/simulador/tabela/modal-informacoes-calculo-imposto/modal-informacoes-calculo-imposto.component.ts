import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  standalone: true,
  imports: [IonicModule, CommonModule],
  selector: 'app-modal-informacoes-calculo-imposto',
  templateUrl: './modal-informacoes-calculo-imposto.component.html',
  styleUrls: ['./modal-informacoes-calculo-imposto.component.scss'],
})
export class ModalInformacoesCalculoImpostoComponent  implements OnInit {
  @Input() item: any;
  @Input() calculoDescontoVlrVendaTotal: number = 0;
  @Input() valorCompra: number = 0;
  @Input() calculoDescontoVlrVendaUn: number = 0;
  @Input() valorTotalImpostoVenda: number = 0;
  @Input() calculateIcms: number = 0;


  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {}

  closeModal() {
    this.modalController.dismiss();
  }

  valorTotalImpostoVendaICMS(item: any): number {
  
    const calculoDescontoVlrVendaTotal = this.calculoDescontoVlrVendaTotal;    
    const aliquotacofinsSaida = item.aliquotacofinsSaida / 100;

    let aliquotaicms = item.aliquotaicms ? item.aliquotaicms.replace(/[^\d,.-]/g, '').replace(',', '.') : '0';
 
    if (['FF', 'II', 'NN'].includes(item.aliquotaicms)) {
        aliquotaicms = '0';
    }
    calculoDescontoVlrVendaTotal * (item.aliquotaicms / 100) 
    aliquotaicms = parseFloat(aliquotaicms) / 100;

    return calculoDescontoVlrVendaTotal *  aliquotaicms;
}
}
