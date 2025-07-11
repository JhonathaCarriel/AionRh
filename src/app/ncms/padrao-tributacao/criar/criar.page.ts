import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { AliquotasService } from 'src/app/services/aliquotas.service';
import { CestService } from 'src/app/services/cest.service';
import { CstService } from 'src/app/services/cst.service';
import { FirebaseNCMService } from 'src/app/services/firebase-ncm.service';
import { NcmService } from 'src/app/services/ncm.service';

export interface EstadoAliquota {
  sigla: string;
  nome: string;
}

@Component({
  selector: 'app-criar',
  templateUrl: './criar.page.html',
  styleUrls: ['./criar.page.scss'],
})
export class CriarPage implements OnInit {
  pageTitle: string = 'Cadastro de Padrão de Tributação'
  TitleSubheader: string = '';
  padraoTributacaoForm: FormGroup;

  cestsDisponiveis: string[] = [];
  descricao: string | null = null;
  estados: EstadoAliquota[] = [];

  constructor(
    private fb: FormBuilder,
    public alertController: AlertController,
    private FirebaseNCMService: FirebaseNCMService,
    private cestService: CestService,
    private ncmService: NcmService,
    private aliquotasService: AliquotasService,
    public cstService: CstService


  ) {

    this.padraoTributacaoForm = this.fb.group({
      descricaoPadraoTributacao: ['', Validators.required],
      cstIPI: [''],
      aliquotaIPI: [0],
      cstpiscofinsEntrada: [''],
      cstpiscofinsSaida: [''],
      aliquotapisEntrada: [],
      aliquotapisSaida: [],
      aliquotacofinsEntrada: [],
      aliquotacofinsSaida: [],
      cst: [''],
      aliquotaicms: [''],
      mvaOriginal: [],
      mvaAliquota12: [],
      mvaAliquota7: [],
      mvaAliquota4: [],
      irpj:[1.20],
      csll:[1.08]
    });

  }

  ngOnInit() {
    this.monitorarUF();
    this.monitorarCst();
    this.monitorarCrt();
    this.monitorarcstpiscofinsEntrada();
    this.monitorarcstpiscofinsSaida();
    this.carregarEstados();

  }


  monitorarCst() {
    this.padraoTributacaoForm.get('cst')?.valueChanges.subscribe((cstValue) => {
      const estado = this.padraoTributacaoForm.get('uf')?.value;
      let aliquotaICMS: string = '0';

      // Adiciona validação de CST
      if (!cstValue) {
        aliquotaICMS = '0';
      } else {
        switch (cstValue) {
          case '00': // CST igual a "00 - Tributado integralmente"
            const aliquotaInterna = this.aliquotasService.getAliquota(estado)?.aliquotaInterna;
            aliquotaICMS = aliquotaInterna ? `${aliquotaInterna}` : '0';


            this.padraoTributacaoForm.get('mvaOriginal')?.setValue(0);
            this.padraoTributacaoForm.get('mvaAliquota12')?.setValue(0);
            this.padraoTributacaoForm.get('mvaAliquota7')?.setValue(0);
            this.padraoTributacaoForm.get('mvaAliquota4')?.setValue(0);
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

      this.padraoTributacaoForm.get('aliquotaicms')?.setValue(aliquotaICMS);
    });
  }



  monitorarcstpiscofinsSaida() {
    this.padraoTributacaoForm.get('cstpiscofinsSaida')?.valueChanges.subscribe((cstValue) => {
      const crtValue = this.padraoTributacaoForm.get('crt')?.value;
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
            aliquotapisSaida = 1.65;
            aliquotacofinsSaida = 7.6;
            break;
          default:
            aliquotapisSaida = 0;
            aliquotacofinsSaida = 0;
            break;
        }

        this.padraoTributacaoForm.get('aliquotapisSaida')?.setValue(aliquotapisSaida);
        this.padraoTributacaoForm.get('aliquotacofinsSaida')?.setValue(aliquotacofinsSaida);
      } else {
        this.padraoTributacaoForm.get('aliquotapisSaida')?.setValue(0);
        this.padraoTributacaoForm.get('aliquotacofinsSaida')?.setValue(0);
      }
    });
  }


  monitorarcstpiscofinsEntrada() {
    this.padraoTributacaoForm.get('cstpiscofinsEntrada')?.valueChanges.subscribe((cstValue) => {
      const crtValue = this.padraoTributacaoForm.get('crt')?.value;

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
        this.padraoTributacaoForm.get('aliquotapisEntrada')?.setValue(aliquotaPIS);
        this.padraoTributacaoForm.get('aliquotacofinsEntrada')?.setValue(aliquotaCOFINS);
      } else {
        // Caso contrário, define como 0%
        this.padraoTributacaoForm.get('aliquotapisEntrada')?.setValue(0);
        this.padraoTributacaoForm.get('aliquotacofinsEntrada')?.setValue(0);
      }
    });
  }


  monitorarUF() {
    this.padraoTributacaoForm.get('uf')?.valueChanges.subscribe((uf) => {
      const estado = this.aliquotasService.getAliquota(uf);
      if (estado) {
        this.padraoTributacaoForm.get('aliquotaicms')?.setValue(estado.aliquotaInterna);
      } else {
        this.padraoTributacaoForm.get('aliquotaicms')?.setValue('');
      }
    });
  }
  monitorarCrt() {
    this.padraoTributacaoForm.get('crt')?.valueChanges.subscribe((crtValue) => {
      switch (crtValue) {
        case '1 – Simples Nacional':
          this.setAliquotas({
            aliquotaIPI: 0,
            aliquotapisEntrada: 0,
            aliquotapisSaida: 0,
            aliquotacofinsEntrada: 0,
            aliquotacofinsSaida: 0,
          }, true);
          break;

        case '2 – Regime Normal: Lucro Presumido':
          this.setAliquotas({
            aliquotaIPI: 0,
            aliquotapisEntrada: 0.65,
            aliquotapisSaida: 0.65,
            aliquotacofinsEntrada: 3,
            aliquotacofinsSaida: 3,
          }, false);
          break;

        case '3 – Regime Normal: Lucro Real':
          this.setAliquotas({
            aliquotaIPI: 0,
            aliquotapisEntrada: 1.65,
            aliquotapisSaida: 1.65,
            aliquotacofinsEntrada: 7.6,
            aliquotacofinsSaida: 7.6,
          }, false);
          break;

        default:
          break;
      }
    });
  }

  private setAliquotas(values: any, isDisabled: boolean) {
    Object.keys(values).forEach((key) => {
      const control = this.padraoTributacaoForm.get(key);
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

  onNcmChange() {
    const ncm = this.padraoTributacaoForm.get('ncm')?.value;
    if (ncm) {
      this.cestsDisponiveis = this.cestService.buscarCestsPorPrefixoNcm(ncm);
      const descricao = this.ncmService.buscarDescricaoPorNcm(ncm);
      this.descricao = descricao || 'Descrição não encontrada';
      this.padraoTributacaoForm.get('descricao')?.setValue(this.descricao);
    } else {
      this.cestsDisponiveis = [];
      this.descricao = '';
      this.padraoTributacaoForm.get('descricao')?.setValue('');
    }
  }
  salvarCadastro(): void {
    if (!this.padraoTributacaoForm.valid) {
      this.exibirAlerta('Formulário Inválido', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const dados = this.padraoTributacaoForm.value;
    const cst = dados.cst;
    const aliquotaIcms = dados.aliquotaicms;
    const cstPisCofinsEntrada = dados.cstpiscofinsEntrada;
    const aliquotaPisEntrada = dados.aliquotapisEntrada;
    const aliquotaCofinsEntrada = dados.aliquotacofinsEntrada;
    const cstPisCofinsSaida = dados.cstpiscofinsSaida;
    const aliquotaPisSaida = dados.aliquotapisSaida;
    const aliquotaCofinsSaida = dados.aliquotacofinsSaida;

    if (cst === '60' && aliquotaIcms !== 'FF') {
      this.exibirAlerta('Validação de ICMS', 'Para CST 60, a alíquota de ICMS deve ser FF.');
      return;
    }

    if (cst === '00' && (!aliquotaIcms || aliquotaIcms === '0')) {
      this.exibirAlerta('Validação de ICMS', 'Para CST 00, a alíquota de ICMS é obrigatória.');
      return;
    }

    if (cst === '00' && (dados.mvaOriginal !== 0 || dados.mvaAliquota12 !== 0 || dados.mvaAliquota7 !== 0 || dados.mvaAliquota4 !== 0)) {
      this.exibirAlerta('Validação de MVA', 'Para CST 00, os campos de MVA devem ser zerados.');
      return;
    }

    if (['04', '05', '06'].includes(cstPisCofinsEntrada) && (aliquotaPisEntrada !== 0 || aliquotaCofinsEntrada !== 0)) {
      this.exibirAlerta('Validação PIS/COFINS Entrada', `Para CST ${cstPisCofinsEntrada}, as alíquotas de PIS e COFINS de entrada devem ser 0.`);
      return;
    }

    if (cstPisCofinsEntrada === '01' && (aliquotaPisEntrada === 0 || aliquotaCofinsEntrada === 0)) {
      this.exibirAlerta('Validação PIS/COFINS Entrada', 'Para CST 01, as alíquotas de PIS e COFINS de entrada não podem ser 0.');
      return;
    }

    if (['04', '05', '06'].includes(cstPisCofinsSaida) && (aliquotaPisSaida !== 0 || aliquotaCofinsSaida !== 0)) {
      this.exibirAlerta('Validação PIS/COFINS Saída', `Para CST ${cstPisCofinsSaida}, as alíquotas de PIS e COFINS de saída devem ser 0.`);
      return;
    }

    if (cstPisCofinsSaida === '01' && (aliquotaPisSaida === 0 || aliquotaCofinsSaida === 0)) {
      this.exibirAlerta('Validação PIS/COFINS Saída', 'Para CST 01, as alíquotas de PIS e COFINS de saída não podem ser 0.');
      return;
    }


    this.FirebaseNCMService.verificarDuplicidadeCompletaPadraoTributacao(dados)
      .then((existe: boolean) => {
        if (existe) {
          this.exibirAlerta('Dados Duplicados', 'Os dados informados já estão cadastrados.');
        } else {
          this.FirebaseNCMService.savePadraoTributacao(dados)
            .then(() => this.mostrarAlertaSucesso())
            .catch((error) => this.mostrarAlertaErro(error));
        }
      })
      .catch((error) => {
        console.error('Erro ao verificar duplicidade', error);
        this.exibirAlerta('Erro', 'Ocorreu um erro ao verificar duplicidade. Tente novamente.');
      });
  }
  private async mostrarAlertaSucesso(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Sucesso',
      message: 'Dados salvos com sucesso!',
      buttons: ['OK'],
    });
    await alert.present();
  }

  private async mostrarAlertaErro(error: any): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Erro',
      message: `Erro ao salvar os dados. Detalhes: ${error.message}`,
      buttons: ['OK'],
    });
    await alert.present();
    console.error('Erro ao salvar dados', error);
  }

  descartar(): void {
    this.padraoTributacaoForm.reset();
    this.exibirAlerta('Descartar', 'As alterações foram descartadas.');
  }
  private async exibirAlerta(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
  onInputIcms(event: any) {
    let value = event.target.value;
    value = value.replace(',', '.'); // Troca vírgula por ponto
    event.target.value = value;
    this.padraoTributacaoForm.get('aliquotaicms')?.setValue(value); // Atualiza o formControl
  }

}