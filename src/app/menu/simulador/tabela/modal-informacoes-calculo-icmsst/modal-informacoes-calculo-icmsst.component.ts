import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  standalone:true,
  imports: [IonicModule, CommonModule],
  selector: 'app-modal-informacoes-calculo-icmsst',
  templateUrl: './modal-informacoes-calculo-icmsst.component.html',
  styleUrls: ['./modal-informacoes-calculo-icmsst.component.scss'],
})
export class ModalInformacoesCalculoIcmsstComponent implements OnInit {
  @Input() item: any;
  @Input() valorICMSST: number = 0;
  @Input() creditoICMSST: number = 0;
  @Input() valorCompra: number = 0;
  @Input() baseIcmsSt: number = 0;
  @Input() debitoIcmsSt: number = 0;
  @Input() calculateIcms: number = 0;
  @Input() calculoDifICMS: number = 0;


  constructor(private modalController: ModalController) {}

  closeModal() {
    this.modalController.dismiss();
  }

  ngOnInit() {
   
  }

  // Função para calcular o valor ICMS ST
  calcularValorICMSST(): number {
    return this.baseIcmsSt * 0.18; // Exemplo, onde a alíquota é 18%
  }

  // Função para calcular o crédito ICMS ST (exemplo)
  calcularCreditoICMSST(): number {
    return this.debitoIcmsSt * 0.12; // Exemplo de crédito
  }
}

