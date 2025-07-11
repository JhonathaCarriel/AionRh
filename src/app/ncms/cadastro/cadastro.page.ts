import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AliquotasService } from 'src/app/services/aliquotas.service';
import { CestService } from 'src/app/services/cest.service';
import { CstService } from 'src/app/services/cst.service';
import { FirebaseNCMService } from 'src/app/services/firebase-ncm.service';
import { NcmService } from 'src/app/services/ncm.service';
export interface PadraoTributacoes{
  descricaoPadraoTributacao:string;
      cstIPI: string;
      aliquotaIPI: number;
      cstpiscofinsEntrada: string;
      cstpiscofinsSaida:string;
      aliquotapisEntrada: number;
      aliquotapisSaida:number;
      aliquotacofinsEntrada: number;
      aliquotacofinsSaida: number;
      cst: string;
      aliquotaicms: string
      mvaOriginal: number;
      mvaAliquota12: number;
      mvaAliquota7:number;
      mvaAliquota4: number;
      irpj:number;
      csll:number;
}
export interface EstadoAliquota {
  sigla: string;
  nome: string;
}
@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
})
export class CadastroPage implements OnInit {
  pageTitle: string = 'Cadastro de Tributação por NCM'
  TitleSubheader: string = '';
  ncmForm: FormGroup;

  cestsDisponiveis: string[] = [];
  descricao: string | null = null;
  estados: EstadoAliquota[] = [];
  padraoTributacoes: PadraoTributacoes[] = [];

  constructor(
    private fb: FormBuilder,
    public alertController: AlertController,
    private FirebaseNCMService: FirebaseNCMService,
    private cestService: CestService,
    private ncmService: NcmService,
    private aliquotasService: AliquotasService,
    public cstService: CstService,
    public router: Router,
    public firestore: AngularFirestore,


  ) {

    this.ncmForm = this.fb.group({
      uf: ['RO', [Validators.required]],
      crt: ['2 – Regime Normal: Lucro Presumido'],
      ncm: ['', Validators.required],
      cest: ['0000000', Validators.required],
      descricao: ['', Validators.required],
      cstIPI: ['99'],
      aliquotaIPI: [0],
      cstpiscofinsEntrada: ['', Validators.required],
      cstpiscofinsSaida: ['', Validators.required],
      aliquotapisEntrada: [0],
      aliquotapisSaida: [0],
      aliquotacofinsEntrada: [0],
      aliquotacofinsSaida: [0],

      cst: ['', [Validators.required]],
      aliquotaicms: ['', Validators.required],
      mvaOriginal: [35, [Validators.required]],
      mvaAliquota12: [47.58, Validators.required],
      mvaAliquota7: [55.96, Validators.required],
      mvaAliquota4: [60.99 , Validators.required],
      irpj:[1.20],
      csll:[1.08],
      padraoTributacao: [''],
    });

  }

  ngOnInit() {
    this.monitorarUF();
    this.monitorarCst();
    this.monitorarCrt();
    this.monitorarcstpiscofinsEntrada();
    this.monitorarcstpiscofinsSaida();
    this.carregarEstados();
    this.loadPadraoTributacao();

  }

  loadPadraoTributacao() {
    this.firestore.collection<PadraoTributacoes>('padraoTributacao', ref => ref.orderBy('descricaoPadraoTributacao'))
      .snapshotChanges()
      .subscribe((snapshot) => {
        this.padraoTributacoes = snapshot.map(a => {
          const data = a.payload.doc.data() as PadraoTributacoes;
          const id = a.payload.doc.id;
          return { ...data, id };
        });
      });
  }

  monitorarCst() {
    this.ncmForm.get('cst')?.valueChanges.subscribe((cstValue) => {
      const estado = this.ncmForm.get('uf')?.value;
      let aliquotaICMS: string = '0';

      // Adiciona validação de CST
      if (!cstValue) {
        aliquotaICMS = '0';
      } else {
        switch (cstValue) {
          case '00': // CST igual a "00 - Tributado integralmente"
            const aliquotaInterna = this.aliquotasService.getAliquota(estado)?.aliquotaInterna;
            aliquotaICMS = aliquotaInterna ? `${aliquotaInterna}` : '0';


            this.ncmForm.get('mvaOriginal')?.setValue(0);
            this.ncmForm.get('mvaAliquota12')?.setValue(0);
            this.ncmForm.get('mvaAliquota7')?.setValue(0);
            this.ncmForm.get('mvaAliquota4')?.setValue(0);
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
            aliquotapisSaida = 1.65;
            aliquotacofinsSaida = 7.6;
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
      if (estado) {
        this.ncmForm.get('aliquotaicms')?.setValue(estado.aliquotaInterna);
      } else {
        this.ncmForm.get('aliquotaicms')?.setValue('');
      }
    });
  }
  monitorarCrt() {
    this.ncmForm.get('crt')?.valueChanges.subscribe((crtValue) => {
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

  onNcmChange() {
    const ncm = this.ncmForm.get('ncm')?.value;
    if (ncm) {
      this.cestsDisponiveis = this.cestService.buscarCestsPorPrefixoNcm(ncm);
      const descricao = this.ncmService.buscarDescricaoPorNcm(ncm);
      this.descricao = descricao || 'Descrição não encontrada';
      this.ncmForm.get('descricao')?.setValue(this.descricao);
    } else {
      this.cestsDisponiveis = [];
      this.descricao = '';
      this.ncmForm.get('descricao')?.setValue('');
    }
  }
  salvarNCM(): void {
    if (!this.ncmForm.valid) {
      this.exibirAlerta('Formulário Inválido', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const dados = this.ncmForm.value;
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


    this.FirebaseNCMService.verificarDuplicidadeCompleta(dados)
      .then((existe: boolean) => {
        if (existe) {
          this.exibirAlerta('Dados Duplicados', 'Os dados informados já estão cadastrados.');
        } else {
          this.FirebaseNCMService.saveNCMDados(dados)
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
    this.ncmForm.reset();
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
    this.ncmForm.get('aliquotaicms')?.setValue(value); // Atualiza o formControl
  }
  openTelaCadastroPadraoTributacao(){
    this.router.navigate(['/ncm/padrao/tributacao/visualizar']);
  }

  tributacaoSelecionada: PadraoTributacoes | null = null;

  preencherCamposTributacao(descricaoPadraoTributacao: string) {
    const descricaoPadraoTributacaoSelecionado = this.padraoTributacoes.find(c => c.descricaoPadraoTributacao === descricaoPadraoTributacao);

    if (descricaoPadraoTributacaoSelecionado) {
      this.ncmForm.patchValue({
        cstIPI: descricaoPadraoTributacaoSelecionado.cstIPI,
        aliquotaIPI: descricaoPadraoTributacaoSelecionado.aliquotaIPI,
        cstpiscofinsEntrada: descricaoPadraoTributacaoSelecionado.cstpiscofinsEntrada,
        cstpiscofinsSaida: descricaoPadraoTributacaoSelecionado.cstpiscofinsSaida,
        aliquotapisEntrada: descricaoPadraoTributacaoSelecionado.aliquotapisEntrada,
        aliquotapisSaida: descricaoPadraoTributacaoSelecionado.aliquotapisSaida,
        aliquotacofinsEntrada: descricaoPadraoTributacaoSelecionado.aliquotacofinsEntrada,
        aliquotacofinsSaida: descricaoPadraoTributacaoSelecionado.aliquotacofinsSaida,
        cst: descricaoPadraoTributacaoSelecionado.cst,
        aliquotaicms: descricaoPadraoTributacaoSelecionado.aliquotaicms,
        mvaOriginal: descricaoPadraoTributacaoSelecionado.mvaOriginal,
        mvaAliquota12: descricaoPadraoTributacaoSelecionado.mvaAliquota12,
        mvaAliquota7: descricaoPadraoTributacaoSelecionado.mvaAliquota7,
        mvaAliquota4: descricaoPadraoTributacaoSelecionado.mvaAliquota4,
        irpj: descricaoPadraoTributacaoSelecionado.irpj,
        csll: descricaoPadraoTributacaoSelecionado.csll
      });
    }
  }


}
