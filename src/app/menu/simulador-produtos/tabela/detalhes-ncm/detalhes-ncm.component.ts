import { DadosTabela } from './../tabela.component';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { AliquotasService } from 'src/app/services/aliquotas.service';
import { AtualizarCamposService } from '../../servicos/atualizar-campos.service';
import { BuscarNcmService } from '../../servicos/buscar-ncm.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule
  ],
  selector: 'app-detalhes-ncm',
  templateUrl: './detalhes-ncm.component.html',
  styleUrls: ['./detalhes-ncm.component.scss'],
})
export class DetalhesNcmComponent implements OnInit {
  @Input() ncm!: string;
  @Input() DadosTabela: any;

  @Input() cest!: string;
  @Input() dadosVarejistacst!: string;
  @Input() dadosVarejistaaliquotacofinsSaida!: any;
  @Input() dadosVarejistaaliquotapisSaida!: any;
  @Input() dadosVarejistaaliquotaicms!: any;
  @Input() dadosVarejistamvaOriginal!: any;
  @Input() dadosVarejistamvaAliquota12!: any;
  @Input() dadosVarejistamvaAliquota7!: any;
  @Input() dadosVarejistamvaAliquota4!: any;
  @Input() dadosVarejistairpj!: any;
  @Input() dadosVarejistacsll!: any;
  @Input() dadosDistribuidoraliquotacofinsSaida!: any;
  @Input() dadosDistribuidoraliquotapisSaida!: any;
  @Input() dadosDistribuidorcst!: string;
  @Input() dadosDistribuidoraliquotaicms!: any;
  @Input() dadosDistribuidormvaOriginal!: any;
  @Input() dadosDistribuidormvaAliquota12!: any;
  @Input() dadosDistribuidormvaAliquota7!: any;
  @Input() dadosDistribuidormvaAliquota4!: any;
  @Input() dadosDistribuidorirpj!: any;
  @Input() dadosDistribuidorcsll!: any;

  DadosTabelaForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private aliquotasService: AliquotasService,
    private atualizarCamposService: AtualizarCamposService,
    private buscarNcmService: BuscarNcmService,
    private alertController: AlertController,
    private router: Router,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    this.DadosTabelaForm = this.formBuilder.group({
      // Varejista fields
      dadosVarejistaaliquotacofinsSaida: [this.dadosVarejistaaliquotacofinsSaida],
      dadosVarejistaaliquotapisSaida: [this.dadosVarejistaaliquotapisSaida],
      dadosVarejistacst: [this.dadosVarejistacst],
      dadosVarejistaaliquotaicms: [this.dadosVarejistaaliquotaicms],
      dadosVarejistamvaOriginal: [this.dadosVarejistamvaOriginal],
      dadosVarejistamvaAliquota12: [this.dadosVarejistamvaAliquota12],
      dadosVarejistamvaAliquota7: [this.dadosVarejistamvaAliquota7],
      dadosVarejistamvaAliquota4: [this.dadosVarejistamvaAliquota4],
      dadosVarejistairpj: [this.dadosVarejistairpj],
      dadosVarejistacsll: [this.dadosVarejistacsll],

      // Distribuidor fields
      dadosDistribuidoraliquotacofinsSaida: [this.dadosDistribuidoraliquotacofinsSaida],
      dadosDistribuidoraliquotapisSaida: [this.dadosDistribuidoraliquotapisSaida],
      dadosDistribuidorcst: [this.dadosDistribuidorcst],
      dadosDistribuidoraliquotaicms: [this.dadosDistribuidoraliquotaicms],
      dadosDistribuidormvaOriginal: [this.dadosDistribuidormvaOriginal],
      dadosDistribuidormvaAliquota12: [this.dadosDistribuidormvaAliquota12],
      dadosDistribuidormvaAliquota7: [this.dadosDistribuidormvaAliquota7],
      dadosDistribuidormvaAliquota4: [this.dadosDistribuidormvaAliquota4],
      dadosDistribuidorirpj: [this.dadosDistribuidorirpj],
      dadosDistribuidorcsll: [this.dadosDistribuidorcsll],
    });
  }



  closeModal() {
    this.modalController.dismiss();
  }
}
