import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Location } from '@angular/common';
import { CestService } from 'src/app/services/cest.service';
import { NcmService } from 'src/app/services/ncm.service';
import { ActivatedRoute, Route } from '@angular/router';
import { AliquotasService } from 'src/app/services/aliquotas.service';
import { CstService } from 'src/app/services/cst.service';

export interface EstadoAliquota {
  sigla: string;
  nome: string;
}
export interface NCM{
  id: string,
  uf: string,
  crt: string,
  ncm: string,
  cest: string,
  descricao: string,
  cstIPI:  string,
  aliquotaIPI: number,
  cstpiscofinsEntrada:  string,
  cstpiscofinsSaida:  string,
  aliquotapisEntrada:number,
  aliquotapisSaida: number,
  aliquotacofinsEntrada: number,
  aliquotacofinsSaida: number,

  cst:  string,
  aliquotaicms: string,
  mvaOriginal: number,
  mvaAliquota12: number,
  mvaAliquota7: number,
  mvaAliquota4: number,
  irpj: number,
  csll: number,
}

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
})
export class EditarPage implements OnInit {
  ncmForm!: FormGroup
  ncm: any = {};
  ncms: NCM[] = [];
  ncmId: string = '';

  cestsDisponiveis: string[] = [];
  descricao: string | null = null;
  pageTitle: string = 'Editar NCM'
  estados: EstadoAliquota[] = [];




  constructor(
    private fb: FormBuilder,
    private firestore: AngularFirestore,
    private location: Location,
    private alertController: AlertController,
    private cestService: CestService,
    private ncmService: NcmService,
    private route: ActivatedRoute,
    private aliquotasService: AliquotasService,
    public cstService: CstService


  )
  {


}

  ngOnInit() {
    this.ncmForm = this.fb.group({
      uf: [''],
      crt: [''],
      ncm: [''],
      cest: [''],
      descricao: [''],
      cstIPI: [''],
      aliquotaIPI:  [],
      cstpiscofinsEntrada: [''],
      cstpiscofinsSaida: [''],
      aliquotapisEntrada: [],
      aliquotapisSaida: [],
      aliquotacofinsEntrada:  [],
      aliquotacofinsSaida:  [],

      cst: [''],
      aliquotaicms: [''],
      mvaOriginal:  [],
      mvaAliquota12:  [],
      mvaAliquota7: [],
      mvaAliquota4:  [],
      irpj: [],
      csll: [],
    });

    this.ncmId = this.route.snapshot.paramMap.get('id')!;
    this.loadNCMData();
    this.carregarEstados();


  }



  loadNCMData(){
    this.firestore.doc<NCM>(`ncm/${this.ncmId}`).valueChanges().subscribe(data => {
      if (data) {
        const ColaboradorData = {
          ...data,
          setor: data.uf.trim(),
        }
        this.ncmForm.patchValue(ColaboradorData);
        this.onNcmChange();
      }
    });
  }
  async atualizarNCM(){
    if (this.ncmForm.valid) {
      try {
        await this.firestore.doc(`ncm/${this.ncmId}`).update(this.ncmForm.value);
        const alert = await this.alertController.create({
          header: 'Sucesso',
          message: 'NCM atualizado com sucesso!',
          buttons: ['OK']
        });
        await alert.present();
        this.location.back();
      } catch (error) {
        const alert = await this.alertController.create({
          header: 'Erro',
          message: 'Ocorreu um erro ao atualizar os dados. Por favor, tente novamente.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      const alert = await this.alertController.create({
        header: 'Erro',
        message: 'Por favor, preencha todos os campos obrigatórios.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
  descartar(){

  }

  onNcmChange() {
    const ncm = this.ncmForm.get('ncm')?.value;
    if (ncm) {
      this.cestsDisponiveis = this.cestService.buscarCestsPorPrefixoNcm(ncm);
      console.log(this.cestsDisponiveis);  // Verifique se a lista é preenchida corretamente
      const descricao = this.ncmService.buscarDescricaoPorNcm(ncm);
      this.descricao = descricao || 'Descrição não encontrada';
      this.ncmForm.get('descricao')?.setValue(this.descricao);
    } else {
      this.cestsDisponiveis = [];
      this.descricao = '';
      this.ncmForm.get('descricao')?.setValue('');
    }
  }
  private async exibirAlerta(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }


  private setAliquotas(values: any, isDisabled: boolean) {
    Object.keys(values).forEach((key) => {
      const control = this.ncmForm.get(key);
      if (control) {
        control.setValue(values[key]);
        if (isDisabled) {
          control.disable();
        } else {
          control.enable();
        }
      }
    });
  }


  carregarEstados() {
    this.estados = this.aliquotasService.getAllEstados();
  }


}
