import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ListaNcmService } from 'src/app/service/lista-ncm.service';
import { AliquotasService } from 'src/app/services/aliquotas.service';
import { CestService } from 'src/app/services/cest.service';
import { FirebaseNCMService } from 'src/app/services/firebase-ncm.service';
import { firstValueFrom } from 'rxjs';
import {jsPDF} from 'jspdf'

export interface NCM{
  id: string,
  uf: string,
  crt: string,
  ncm: string,
  cest:string,
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
  mvaOriginal: number,
  mvaAliquota12: number,
  mvaAliquota7: number,
  mvaAliquota4: number,
  irpj: number,
  csll:number
}

import { NcmService } from 'src/app/services/ncm.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
export interface EstadoAliquota {
  sigla: string;
  nome: string;
}

@Component({
  selector: 'app-simulador',
  templateUrl: './simulador.page.html',
  styleUrls: ['./simulador.page.scss'],
})
export class SimuladorPage implements OnInit {

  simuladorForm: FormGroup;
  pageTitle: string = 'Simulador de Produtos'
  tabelaInformacoes: any[] = [];

  estados: EstadoAliquota[] = [];
  cest: string | null = null;
  cestsDisponiveis: string[] = [];
  descricao: string | null = null;
  isFreteModalOpen = false;
  valorFrete!: number;
  valorCompraVenda!: number; tipoCalculoFrete: string = '';
  exibirMva: boolean = false;
  cestOptions: any[] = [];
  ncms: NCM[] = [];



  atividades = [
    { nome: 'Atacadista' },
    { nome: 'Distribuidor' },
    { nome: 'Fabricante' },
    { nome: 'Varejista' },
    { nome: 'Indústria' }
  ]

  boleanos = [
    { nome: 'Sim', value: 'Sim' },
    { nome: 'Não', value: 'Nao' }
  ]



  constructor(
    private formBuilder: FormBuilder,
    private listaNcmService: ListaNcmService,
    private aliquotasService: AliquotasService,
    private FirebaseNCMService: FirebaseNCMService,
    private firestore: AngularFirestore,
    public alertController: AlertController,
    public router: Router,

    private cestService: CestService,
    private ncmService: NcmService,

  ) {
    this.simuladorForm = this.formBuilder.group({

      nomeFornecedor: ['Gerdal', [Validators.required]],
      ufFornecedor: ['SP', [Validators.required]],
      aliquotaInterestadualFornecedor: [],
      atividadeFornecedor: ['Varejista', [Validators.required]],
      nfeCompraFornecedor: ['Sim'],

      nomeDistribuidor: ['Suporte Matriz', [Validators.required]],
      ufDistribuidor: ['RO', [Validators.required]],
      aliquotaInternaDistribuidor:[],
      atividadeDistribuidor: ['Distribuidor', [Validators.required]],
      nfeTransferenciaDistribuidor: ['Nao'],


      nomeVarejista: ['Suporte Filial', [Validators.required]],
      ufVarejista: ['RO', [Validators.required]],
      atividadeVarejista: ['Varejista', [Validators.required]],
      nfeVendaVarejista: ['Sim'],


      percentualMargem: ['300'],
      percentualDesconto: ['21.998'],
      percentualTaxas: ['15'],
      percentualFreteCompra: ['0'],
      percentualFreteVenda: ['1.5'],
      comissaoDistribuidor: ['1.0'],
      comissaoVarejista: ['0.5'],


      paraQuemSimulacao:['TRATOR DA EDUCAÇÃO'],
      nomeProduto: ['D95148 - VEDADOR...', [Validators.required]],
      produtoImportado: ['Nao'],
      quantidadeProduto: ['1.0'],
      valorCompraProdutoUnitario: ['1.0'],
      ncmCompra: ['', [Validators.required, Validators.maxLength(8)]],
      cestCompra:[''],
      percentualMVA: [''],
      cst: [''],
      ncmVenda: ['', [Validators.required, Validators.maxLength(8)]],
      cestVenda: [''],


    });
  }



  ngOnInit() {
    this.carregarEstados();
    this.atualizadorProdutosImportado();
    this.atualizadoraliquotaInterestadualFornecedor();
    this.controlarCampo();

    this.loadncm();
  }

loadncm(){
  this.firestore.collection<NCM>('ncm', ref => ref.orderBy('uf'))
  .snapshotChanges()
  .subscribe((snapshot) => {
    this.ncms = snapshot.map(a => {
      const data = a.payload.doc.data() as NCM;
      const id = a.payload.doc.id;
      return { ...data, id };
    });

  });
}
  async controlarCampo() {
    const nfeTransferenciaDistribuidor = this.simuladorForm.get('nfeTransferenciaDistribuidor')?.value;

    if (nfeTransferenciaDistribuidor === 'Sim') {
        alert('Essa funcionalidade ainda está sendo desenvolvida. Por favor, aguarde.');

        // Após o alerta, altera o valor para 'Não'
        this.simuladorForm.get('nfeTransferenciaDistribuidor')?.setValue('Nao');
    }
}

  atualizadorProdutosImportado() {
    this.simuladorForm.get('produtoImportado')?.valueChanges.subscribe((produtoImportado) => {
      if (produtoImportado) {
        this.atualizarAliquotaFornecedor();
        this.atualizarAliquotaDistribuidor();
      }
    });




  }
  atualizadoraliquotaInterestadualFornecedor() {
    this.simuladorForm.get('valorCompraProdutoUnitario')?.valueChanges.subscribe((valorCompraProdutoUnitario) => {
      if (valorCompraProdutoUnitario) {
        this.atualizarAliquotaFornecedor();
        this.atualizarAliquotaDistribuidor();
        this.buscarCestCompra();
        this.buscarCestVenda();

      }

    });
  }
  carregarEstados() {
    this.estados = this.aliquotasService.getAllEstados();
  }
  async adicionarNaTabela() {
    // Primeiro, chama o onCheckNcm()
    this.onCheckNcm();

    // Verifica se o formulário é válido
    if (this.simuladorForm.valid) {
      const formData = this.simuladorForm.value;

      // Faz a consulta ao NCM
      const ncmDataVenda = await firstValueFrom(this.FirebaseNCMService.consultaNCMVenda(
        formData.ncmVenda,
        formData.ufVarejista
      ));

      // Verifica se o resultado não está vazio e se o NCM é válido
      const ncmData = ncmDataVenda.length > 0 ? ncmDataVenda[0] : null;

      if (!ncmData) {
        // Caso o NCM seja inválido, retorna um erro e não adiciona o item
        console.error('NCM inválido');
        return;
      }

      // Atualiza os campos do formData com os valores de ncmData
      formData.irpj = ncmData?.irpj || '0.00';
      formData.csll = ncmData?.csll || '0.00';
      formData.aliquotacofinsSaida = ncmData?.aliquotacofinsSaida || '0.00';
      formData.aliquotapisSaida = ncmData?.aliquotapisSaida || '0.00';
      formData.aliquotaicms = ncmData?.aliquotaicms || '0.00';

      // Adiciona o novo item ao array
      this.tabelaInformacoes.push({ ...formData });
    } else {
      console.error('Formulário inválido');
    }
  }

  atualizarNcmVenda() {
    // Verifica se o campo ncmCompra tem valor e atualiza ncmVenda
    if (this.simuladorForm.get('ncmCompra')?.value) {
      this.simuladorForm.get('ncmVenda')?.setValue(this.simuladorForm.get('ncmCompra')?.value);
    }
  }

  buscarCestCompra() {
    const ncmCompra = this.simuladorForm.get('ncmCompra')?.value;
    const ufDistribuidor = this.simuladorForm.get('ufDistribuidor')?.value; // Obtém o valor da UF do distribuidor

    if (!ncmCompra || !ufDistribuidor) {
      return; // Caso o NCM ou UF não estejam preenchidos, retorna sem fazer nada
    }

    this.firestore
      .collection<NCM>('ncm', ref => ref
        .where('ncm', '==', ncmCompra) // Filtra pelo NCM
        .where('uf', '==', ufDistribuidor) // Filtra pela UF do distribuidor
        .orderBy('uf')) // Ordena pelo campo 'uf'
      .snapshotChanges()
      .subscribe((snapshot) => {
        this.cestOptions = []; // Limpa as opções de CEST antes de preenchê-las

        snapshot.forEach((a) => {
          const data = a.payload.doc.data() as NCM;
          const id = a.payload.doc.id;

          // Verifica se o campo 'cest' existe nos dados
          if (data.cest) {
            this.cestOptions.push({
              cest: data.cest,
              id: id // Adiciona o id ao objeto retornado
            });
          }
        });
      }, (error) => {
        console.error('Erro ao buscar CEST:', error); // Registra erro no console
      });
  }
  buscarCestVenda(){
    const ncmVenda = this.simuladorForm.get('ncmVenda')?.value;
    const ufVarejista= this.simuladorForm.get('ufVarejista')?.value; // Obtém o valor da UF do distribuidor

    if (!ncmVenda || !ufVarejista) {
      return; // Caso o NCM ou UF não estejam preenchidos, retorna sem fazer nada
    }

    this.firestore
      .collection<NCM>('ncm', ref => ref
        .where('ncm', '==', ncmVenda) // Filtra pelo NCM
        .where('uf', '==', ufVarejista) // Filtra pela UF do distribuidor
        .orderBy('uf')) // Ordena pelo campo 'uf'
      .snapshotChanges()
      .subscribe((snapshot) => {
        this.cestOptions = []; // Limpa as opções de CEST antes de preenchê-las

        snapshot.forEach((a) => {
          const data = a.payload.doc.data() as NCM;
          const id = a.payload.doc.id;

          // Verifica se o campo 'cest' existe nos dados
          if (data.cest) {
            this.cestOptions.push({
              cest: data.cest,
              id: id
            });
          }
        });
      }, (error) => {
        console.error('Erro ao buscar CEST:', error); // Registra erro no console
      });

  }


  calcular() {
    const item = this.simuladorForm.value;

  }

  //Modal para calcular o frete de compra e venda
  openFreteModal(tipo: string): void {
    this.tipoCalculoFrete = tipo;
    this.isFreteModalOpen = true;
  }
  closeFreteModal(): void {
    this.isFreteModalOpen = false;
  }
  calcularFrete(): void {
    if (this.valorFrete && this.valorCompraVenda) {
      const resultadoFrete = (this.valorFrete / this.valorCompraVenda) * 100;

      if (this.tipoCalculoFrete === 'compra') {
        this.simuladorForm.patchValue({
          percentualFreteCompra: `${resultadoFrete.toFixed(2)}`
        });
      } else if (this.tipoCalculoFrete === 'venda') {
        this.simuladorForm.patchValue({
          percentualFreteVenda: `${resultadoFrete.toFixed(2)}`
        });
      }

      this.closeFreteModal();
    }
  }
  // Final

  async showAlertForNcm() {
    const alert = await this.alertController.create({
      header: 'NCM Não Encontrado',
      message: 'O NCM informado não foi encontrado. Deseja cadastrar agora?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Cadastrar',
          handler: () => {
            this.router.navigate(['/cadastro/ncm']);
          }
        }
      ]
    });

    await alert.present();
  }
  onCheckNcm() {
    const ncmCompraValue = this.simuladorForm.get('ncmCompra')?.value;
    this.simuladorForm.patchValue({
      ncmVenda: ncmCompraValue
    });
    // Obter valores do formulário
    const ncmCompra = this.simuladorForm.get('ncmCompra')?.value;
    const cestCompra = this.simuladorForm.get('cestCompra')?.value;
    const aliquotaInterestadualFornecedor = this.simuladorForm.get('aliquotaInterestadualFornecedor')?.value;
    const produtoImportado = this.simuladorForm.get('produtoImportado')?.value;

    const ncmVenda = this.simuladorForm.get('ncmVenda')?.value;
    const cestVenda = this.simuladorForm.get('cestVenda')?.value;
    const ufDistribuidor = this.simuladorForm.get('ufDistribuidor')?.value;
    const ufVarejista = this.simuladorForm.get('ufVarejista')?.value;

    // Verifica NCM de Compra
    if (ncmCompra && cestCompra && ufDistribuidor) {
      this.verificarNcmCompra(ncmCompra, cestCompra, ufDistribuidor, aliquotaInterestadualFornecedor, produtoImportado);
    } else {
      this.showAlertForNcm();
    }

    // Verifica NCM de Venda
    if (ncmVenda && cestVenda && ufVarejista) {
      this.verificarNcmVenda(ncmVenda, cestVenda, ufVarejista);
    } else {
      this.showAlertForNcm();
    }
  }

  private verificarNcmCompra(
    ncmCompra: string,
    cestCompra: string,
    ufDistribuidor: string,
    aliquotaInterestadualFornecedor: number,
    produtoImportado: string
  ) {
    // Obter os campos do formulário
    const mvaField = this.simuladorForm.get('percentualMVA');
    const cstField = this.simuladorForm.get('cst'); // Campo para CST

    // Obter os dados do NCM para o distribuidor
    this.ncmService.getNcmData(ncmCompra, ufDistribuidor, ).subscribe({
      next: (ncmData) => {
        if (ncmData) {
          // Calcular o percentualMVA com base nas informações
          let percentualMVA = this.calcularMVA(ncmData, aliquotaInterestadualFornecedor, produtoImportado);

          // Atribuir o valor do MVA ao campo do formulário
          if (mvaField) {
            mvaField.setValue(percentualMVA);
          }

          // Atribuir o CST ao campo do formulário
          if (cstField) {
            cstField.setValue(ncmData.cst);
          }

          console.log('NCM Compra MVAs:', ncmData);
          console.log('Percentual MVA calculado:', percentualMVA);
          console.log('CST retornado:', ncmData.cst);

        } else {
          this.showAlertForNcm();
        }
      },
      error: () => {
        this.showAlertForNcm();
      }
    });
  }


  private calcularMVA(ncmData: any, aliquotaInterestadualFornecedor: number, produtoImportado: string): number {
    let percentualMVA: number;

    switch (aliquotaInterestadualFornecedor) {
      case 12:
        percentualMVA = ncmData.mvaAliquota12;
        break;
      case 7:
        percentualMVA = ncmData.mvaAliquota7;
        break;
      case 0:
        percentualMVA = ncmData.mvaOriginal;
        break;
      default:
        percentualMVA = ncmData.mvaOriginal;
    }


    if (produtoImportado === 'Sim') {
      percentualMVA = ncmData.mvaAliquota4;
    }

    return percentualMVA;
  }
  private verificarNcmVenda(ncmVenda: string, cestVenda: string, ufVarejista: string) {
    this.ncmService.checkNcmExists(ncmVenda, ufVarejista, cestVenda).subscribe({
      next: (exists) => {
        if (!exists) {
          this.showAlertForNcm();
        }
      },
      error: () => {
        this.showAlertForNcm();
      }
    });
  }

  atualizarAliquotaFornecedor() {
    const ufFornecedor = this.simuladorForm.get('ufFornecedor')?.value;
    const ufDestino = this.simuladorForm.get('ufDistribuidor')?.value;
    const produtosImportado = this.simuladorForm.get('produtoImportado')?.value; // Verifique o nome do campo aqui

    if (produtosImportado === 'Sim') {
      // Se o produto for importado, a alíquota deve ser 4
      this.simuladorForm.patchValue({ aliquotaInterestadualFornecedor: 4 });
      console.log('Alíquota ajustada para 4 devido a produto importado.');
    } else if (ufFornecedor && ufDestino) {
      // Se as UFs estiverem preenchidas, pega a alíquota de interesse
      const aliquota = this.aliquotasService.getAliquotaInterestadualFornecedor(ufFornecedor, ufDestino);

      if (aliquota !== undefined) {
        this.simuladorForm.patchValue({ aliquotaInterestadualFornecedor: aliquota });
      } else {
        this.simuladorForm.patchValue({ aliquotaInterestadualFornecedor: '' });
        console.error(`Nenhuma alíquota encontrada para a combinação UF Fornecedor: ${ufFornecedor}, UF Destino: ${ufDestino}`);
      }
    } else {
      console.error('UF do fornecedor ou UF de destino estão ausentes.');
    }
  }
  atualizarAliquotaDistribuidor() {
    const ufDestino = this.simuladorForm.get('ufDistribuidor')?.value;
    const aliquota = this.aliquotasService.getAliquotaInternaDistribuidor(ufDestino);

    // Atualizando o valor da aliquotaInternaDistribuidor no formulário
    this.simuladorForm.get('aliquotaInternaDistribuidor')?.setValue(aliquota);
  }








}
