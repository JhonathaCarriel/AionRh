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
  aliquotaIPI: string,
  cstpiscofinsEntrada:  string,
  cstpiscofinsSaida:  string,
  aliquotapisEntrada:string,
  aliquotapisSaida: string,
  aliquotacofinsEntrada: string,
  aliquotacofinsSaida: string,
  cfop: string,
  cst:  string,
  aliquotaicms: string,
  mvaOriginal: string,
  mvaAliquota12: string,
  mvaAliquota7: string,
  mvaAliquota4: string,
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
      aliquotaIPI: [''],
      cstpiscofinsEntrada: [''],
      cstpiscofinsSaida: [''],
      aliquotapisEntrada: [''],
      aliquotapisSaida: [''],
      aliquotacofinsEntrada: [''],
      aliquotacofinsSaida: [''],
      cfop: [''],
      cst: [''],
      aliquotaicms: [''],
      mvaOriginal: [''],
      mvaAliquota12: [''],
      mvaAliquota7: [''],
      mvaAliquota4: [''],
      irpj:['1.20'],
      csll:['1.08']
    });

    this.ncmId = this.route.snapshot.paramMap.get('id')!;
    this.loadNCMData();
    this.carregarEstados();
    this.monitorarUF();
    this.monitorarCst();
    this.monitorarCrt();
    this.monitorarcstpiscofinsEntrada();
    this.monitorarcstpiscofinsSaida();
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

  monitorarCst() {
    this.ncmForm.get('cst')?.valueChanges.subscribe((cstValue) => {
      const estado = this.ncmForm.get('uf')?.value;
      let aliquotaICMS: string = '0%';

      // Adiciona validação de CST
      if (!cstValue) {
        aliquotaICMS = '0';
      } else {
        switch (cstValue) {
          case '00': // CST igual a "00 - Tributado integralmente"
            const aliquotaInterna = this.aliquotasService.getAliquota(estado)?.aliquotaInterna;
            aliquotaICMS = aliquotaInterna ? `${aliquotaInterna}` : '0';

            // Zerar os campos MVA
            this.ncmForm.get('mvaOriginal')?.setValue('0');
            this.ncmForm.get('mvaAliquota12')?.setValue('0');
            this.ncmForm.get('mvaAliquota7')?.setValue('0');
            this.ncmForm.get('mvaAliquota4')?.setValue('0');
            break;
          case '60':
            aliquotaICMS = 'FF';
            break;
          case '40':
            aliquotaICMS = 'II';
            break;
          case '41':
            aliquotaICMS = 'NN';
            break;
          default:
            aliquotaICMS = '0';
            break;
        }
      }

      this.ncmForm.get('aliquotaicms')?.setValue(aliquotaICMS);
    });
  }


  monitorarcstpiscofinsSaida() {
    this.ncmForm.get('cstpiscofinsSaida')?.valueChanges.subscribe((cstValue) => {
      const crtValue = this.ncmForm.get('crt')?.value;
      const validCSTs = ['01', '02', '03', '67'];

      if (validCSTs.includes(cstValue)) {
        let aliquotapisSaida: number = 0;
        let aliquotacofinsSaida: number = 0;

        switch (crtValue) {
          case '1 – Simples Nacional':
            aliquotapisSaida = 0;
            aliquotacofinsSaida = 0;
            break;
          case '2 – Regime Normal: Lucro Presumido':
            aliquotapisSaida = 0.65;
            aliquotacofinsSaida = 3;
            break;
          case '3 – Regime Normal: Lucro Real':
            aliquotapisSaida = 1,65;
            aliquotacofinsSaida = 7,6;
            break;
          default:
            aliquotapisSaida = 0;
            aliquotacofinsSaida = 0;
            break;
        }

        this.ncmForm.get('aliquotapisSaida')?.setValue(aliquotapisSaida);
        this.ncmForm.get('aliquotacofinsSaida')?.setValue(aliquotacofinsSaida);
      } else {
        this.ncmForm.get('aliquotapisSaida')?.setValue(0);
        this.ncmForm.get('aliquotacofinsSaida')?.setValue(0);
      }
    });
  }


  monitorarcstpiscofinsEntrada() {
    this.ncmForm.get('cstpiscofinsEntrada')?.valueChanges.subscribe((cstValue) => {
      const crtValue = this.ncmForm.get('crt')?.value;

      // Lista de CSTs válidos
      const validCSTs = ['50', '51', '52', '53', '54', '55', '56'];

      if (validCSTs.includes(cstValue)) {
        let aliquotaPIS: number = 0;
        let aliquotaCOFINS: number = 0;

        // Define as alíquotas com base no CRT
        switch (crtValue) {
          case '1 – Simples Nacional':
            aliquotaPIS = 0;
            aliquotaCOFINS = 0;
            break;
          case '2 – Regime Normal: Lucro Presumido':
            aliquotaPIS = 0.65;
            aliquotaCOFINS = 3;
            break;
          case '3 – Regime Normal: Lucro Real':
            aliquotaPIS = 1.65;
            aliquotaCOFINS = 7.6;
            break;
          default:
            break;
        }

        // Atualiza os valores dos campos
        this.ncmForm.get('aliquotapisEntrada')?.setValue(aliquotaPIS);
        this.ncmForm.get('aliquotacofinsEntrada')?.setValue(aliquotaCOFINS);
      } else {
        // Caso contrário, define como 0%
        this.ncmForm.get('aliquotapisEntrada')?.setValue(0);
        this.ncmForm.get('aliquotacofinsEntrada')?.setValue(0);
      }
    });
  }


  monitorarUF() {
    this.ncmForm.get('uf')?.valueChanges.subscribe((uf) => {
      const estado = this.aliquotasService.getAliquota(uf);
      const cst = this.ncmForm.get('cst')?.value;
      let aliquotaICMS = '';

      switch (cst) {
        case '00': // CST igual a 00
          if (estado) {
            aliquotaICMS = estado.aliquotaInterna.toString(); // Converte o número para string
          } else {
            aliquotaICMS = '';
          }
          break;
        case '60': // CST igual a 60
          aliquotaICMS = 'FF';
          break;
        case '40': // CST igual a 40
          aliquotaICMS = 'II';
          break;
        case '41': // CST igual a 41
          aliquotaICMS = 'NN';
          break;
        default: // Qualquer outro valor
          aliquotaICMS = '0';
          break;
      }

      // Define o valor do campo aliquotaICMS
      this.ncmForm.get('aliquotaicms')?.setValue(aliquotaICMS);
    });
  }


  monitorarCrt() {
    this.ncmForm.get('crt')?.valueChanges.subscribe((crtValue) => {
      switch (crtValue) {
        case '1 – Simples Nacional':
          this.setAliquotas({
            aliquotaIPI: '0',
            aliquotapisEntrada: '0',
            aliquotapisSaida: '0',
            aliquotacofinsEntrada: '0',
            aliquotacofinsSaida: '0',
          }, true);
          break;

        case '2 – Regime Normal: Lucro Presumido':
          this.setAliquotas({
            aliquotaIPI: '0',
            aliquotapisEntrada: '0.65',
            aliquotapisSaida: '0.65',
            aliquotacofinsEntrada: '3',
            aliquotacofinsSaida: '3',
          }, false);
          break;

        case '3 – Regime Normal: Lucro Real':
          this.setAliquotas({
            aliquotaIPI: '0',
            aliquotapisEntrada: '1.65',
            aliquotapisSaida: '1.65',
            aliquotacofinsEntrada: '7.6',
            aliquotacofinsSaida: '7.6',
          }, false);
          break;

        default:
          break;
      }
    });
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
