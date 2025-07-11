
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AliquotasService } from 'src/app/services/aliquotas.service';

import { Observable } from 'rxjs';
import { combineLatest } from 'rxjs';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AtualizarCamposService } from '../servicos/atualizar-campos.service';
import { BuscarNcmService } from '../servicos/buscar-ncm.service';
import { CadastroPage } from 'src/app/ncms/cadastro/cadastro.page';
import { CriarComponent } from '../../fornecedores/criar/criar.component';
import { LoggerService } from 'src/app/services/logger.service';

export interface EstadoAliquota {
  sigla: string;
  nome: string;
}
export interface Atividades {
  nome: string;
}

export interface Boleanos {
  nome: string;
}
export interface NCMs{
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
  cfop: string,
  cst:  string,
  aliquotaicms: string,
  mvaOriginal: number,
  mvaAliquota12: number,
  mvaAliquota7: number,
  mvaAliquota4: number,
  irpj: number,
  csll: number,
}
interface DadosVarejista {
  dadosVarejistauf: string;
  dadosVarejistacrt: string;
  dadosVarejistancm: string;
  dadosVarejistacest: string;
  dadosVarejistadescricao: string;
  dadosVarejistacstIPI: string;
  dadosVarejistaaliquotaIPI: number;
  dadosVarejistacstpiscofinsEntrada: string;
  dadosVarejistacstpiscofinsSaida: string;
  dadosVarejistaaliquotapisEntrada: number;
  dadosVarejistaaliquotapisSaida: number;
  dadosVarejistaaliquotacofinsEntrada: number;
  dadosVarejistaaliquotacofinsSaida: number;
  dadosVarejistacfop: string;
  dadosVarejistacst: string;
  dadosVarejistaaliquotaicms: string;
  dadosVarejistaaliquotaDifal: number;
  dadosVarejistamvaOriginal: number;
  dadosVarejistamvaAliquota12: number;
  dadosVarejistamvaAliquota7: number;
  dadosVarejistamvaAliquota4: number;
  dadosVarejistairpj: number;
  dadosVarejistacsll: number;
}

export interface Produtos{
  id: string,
  cabecalhoId: string,
  sequencia: number,
  dataHoraInsercao: string,

  nomeFornecedor: string,
  ufFornecedor: string,
  aliquotaInterestadualFornecedor: number,
  aliquotaInternaFornecedor: number,
  atividadeFornecedor: string,
  nfeCompraFornecedor: string,

  nomeDistribuidor: string,
  ufDistribuidor: string,
  aliquotaInterestadualDistribuidor: number,
  aliquotaInternaDistribuidor: number,
  atividadeDistribuidor: string,
  nfeTransferenciaDistribuidor: string,

  nomeVarejista: string,
  ufVarejista: string,
  aliquotaInternaVarejista: number,
  atividadeVarejista: string,
  nfeVendaVarejista: string,

  nomeCliente: string,
  ufCliente: string,
  aliquotaInternaCliente: number,
  atividadeCliente: string,


  percentualMargem: number,
  percentualDesconto: number,
  percentualTaxas: number,
  comissaoVarejista: number,
  comissaoDistribuidor: number,
  percentualFreteCompra: number,
  percentualFreteVenda: number,
  percentualFreteTransferencia: number,
  nomeProduto: string,

  numeroOs: string,
  quantidadeProduto: number,
  valorCompraProdutoUnitario: number,
  produtoImportado: string,
  produtoEstoque: string,
  consumidorFinal: string,
  ncm: string,
  cest: string,
  cst: string,
  dadosVarejista: DadosVarejista,
  dadosDistribuidor: DadosVarejista,
}

export interface Fornecedores{
  id: string,
  cnpj: string,
  nomeEmpresa:  string,
  razaoSocial: string,
  estado:  string,
  municipio: string,
  logradouro:  string,
  numero:  string,
  bairro:  string,
  cep:  string,
  telefone1: string,
  telefone2:  string,
  atividadeFornecedor:  string,
  nfeCompraFornecedor:  string,
  tipoDeEmpresa:  string,
}

export interface Clientes{
  id: string,
  cnpj: string,
  nomeEmpresa:  string,
  razaoSocial: string,
  estado:  string,
  municipio: string,
  logradouro:  string,
  numero:  string,
  bairro:  string,
  cep:  string,
  telefone1: string,
  telefone2:  string,
  atividadeFornecedor:  string,
  tipoDeEmpresa:  string,
}

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
})
export class EditarPage implements OnInit {
  private toastQueue: HTMLIonToastElement[] = [];
  private isShowingToast = false;
  pageTitle: string = 'Simulação de Produtos'
  simuladorForm: FormGroup;
  tabelaInformacoes: any[] = [];

  exibir: boolean = true;
  cabecalhoId: string = '';
  servicoId: string = '';


  estados: EstadoAliquota[] = [];
  atividades: Atividades[] = [];
  boleanos: Boleanos[] = []
  cestOptions: any[] = [];

  fornecedores: Fornecedores[] = [];
  distribuidores: Fornecedores[] = [];
  varejistas: Fornecedores[] = [];
  clientes: Fornecedores[] = [];

  produtosSimulados: Produtos[] = [];

  itemSelecionado: any = null;

  activeTab: string = 'dados-fornecedor'; // Variável para controlar a aba ativa
  //Campos Modal Fretes
  isFreteModalOpen = false;
  valorFrete!: number;
  valorCompraVenda!: number; tipoCalculoFrete: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private aliquotasService: AliquotasService,
    private atualizarCamposService: AtualizarCamposService,
    private buscarNcmService: BuscarNcmService,
    private alertController: AlertController,
    private router: Router,
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private toastController: ToastController,
    private loggerService: LoggerService,
    private modalController: ModalController,
  ) {
    this.simuladorForm = this.formBuilder.group({
 // Fornecedor
 nomeFornecedor: ['', Validators.required],
 ufFornecedor: [''],
 aliquotaInterestadualFornecedor: [],
 aliquotaInternaFornecedor: [],
 atividadeFornecedor: [''],
 nfeCompraFornecedor: [''],

 // Distribuidor
 nomeDistribuidor: ['', Validators.required],
 ufDistribuidor: [''],
 aliquotaInterestadualDistribuidor: [],
 aliquotaInternaDistribuidor: [],
 atividadeDistribuidor: [''],
 nfeTransferenciaDistribuidor: [''],

 // Varejista
 nomeVarejista: ['', Validators.required],
 ufVarejista: [''],
 aliquotaInternaVarejista:[],
 atividadeVarejista: [''],
 nfeVendaVarejista: [''],

 nomeCliente: ['', Validators.required],
 ufCliente:  [''],
 aliquotaInternaCliente: [],
 atividadeCliente: [''],


 // Valores Predeterminados
 percentualMargem: [300],
 percentualDesconto: [21.988],
 percentualTaxas: [15],
 comissaoVarejista: [0.5],
 comissaoDistribuidor: [1],
 percentualFreteCompra: [0],
 percentualFreteVenda: [0],
 percentualFreteTransferencia:[0],

 // Produtos
 nomeProduto: ['', Validators.required],

 numeroOs: [''],
 quantidadeProduto: [, Validators.required],
 valorCompraProdutoUnitario: [, Validators.required],
 produtoImportado: ['Não'],
 produtoEstoque: ['Não'],
 consumidorFinal: ['Não'],
 ncm: ['', Validators.required],
 cest: [''],
 cst: [''],


 //Dados NCM Varejista
 dadosVarejistacst: ['', Validators.required],
 dadosVarejistaaliquotacofinsSaida: [],
 dadosVarejistaaliquotapisSaida:[],
 dadosVarejistaaliquotaicms:[''],
 dadosVarejistaaliquotaDifal:[],
 dadosVarejistamvaOriginal: [],
 dadosVarejistamvaAliquota12: [],
 dadosVarejistamvaAliquota7: [],
 dadosVarejistamvaAliquota4: [],
 dadosVarejistairpj: [],
 dadosVarejistacsll:[],

 //Dados NCM Distribuidor
 dadosDistribuidoraliquotacofinsSaida:  [],
 dadosDistribuidoraliquotapisSaida:  [],
 dadosDistribuidorcst:  ['', Validators.required],
 dadosDistribuidoraliquotaicms:  [''],
 dadosDistribuidormvaOriginal: [],
 dadosDistribuidormvaAliquota12:  [],
 dadosDistribuidormvaAliquota7:  [],
 dadosDistribuidormvaAliquota4: [],
 dadosDistribuidorirpj: [],
 dadosDistribuidorcsll: [],


    });


  }
  ngOnInit() {
     this.servicoId = this.route.snapshot.paramMap.get('id')!;
     this.cabecalhoId = this.route.snapshot.paramMap.get('id')!;// Gerar um ID único

     this.carregarCampos();

   }
   carregarCampos(){
     this.carregarEstados();
     this.carregarAtividades();
     this.carregarBoleanos();

     this.atualizarAliquotaDistribuidor();
     this.atualizarAliquotaVarejista();
     this.atualizarAliquotas();
     this.carregarDadosFornecedor();
     this.carregarDadosDistribuidor();
     this.carregarDadosVarejista();
     this.carregarDadosCliente();
     this.carregarProdutosSimulados();
     this.carregarCabecalhoProdutos();
     this.carregarAliquotaVarejista();

   }
   carregarAliquotaVarejista() {
     this.simuladorForm.get('ufVarejista')?.valueChanges.subscribe(() => this.atualizarAliquotasVarejista());
     this.simuladorForm.get('ufCliente')?.valueChanges.subscribe(() => this.atualizarAliquotasVarejista());
     this.simuladorForm.get('nomeCliente')?.valueChanges.subscribe(() => this.atualizarAliquotasVarejista());
     this.simuladorForm.get('nomeVarejista')?.valueChanges.subscribe(
       () => this.atualizarAliquotasVarejista()
     );
     this.simuladorForm.get('ufFornecedor')?.valueChanges.subscribe(
       () => this.atualizarAliquotaFornecedor(),

     );
     this.simuladorForm.get('produtoImportado')?.valueChanges.subscribe(
       () => this.atualizarAliquotaFornecedor(),

     );
     this.simuladorForm.get('nomeDistribuidor')?.valueChanges.subscribe(
       () => this.atualizarAliquotaDistribuidor(),
     );
     this.simuladorForm.get('atividadeCliente')?.valueChanges.subscribe(() => this.atualizarAliquotasVarejista());
     this.simuladorForm.get('produtoImportado')?.valueChanges.subscribe(() => this.atualizarAliquotasVarejista());
     this.simuladorForm.get('aliquotaInternaCliente')?.valueChanges.subscribe(() => this.atualizarAliquotasVarejista());
   }

   carregarCabecalhoProdutos() {
     this.firestore.collection('cabecalhoProdutos').doc(this.cabecalhoId).get().subscribe(
       (doc) => {
         if (doc.exists) {
           const data = doc.data();
           if (data) {
             this.preencherFormularioComDadosCabecalho(data);

           }
         } else {
           console.warn('Cabeçalho não encontrado.');
         }
       },
       (error) => {
         console.error('Erro ao carregar cabeçalho:', error);
       }
     );
   }

   preencherFormularioComDadosCabecalho(item: any) {
     this.simuladorForm.patchValue({
       // Fornecedor
       nomeFornecedor: item.nomeFornecedor,
       ufFornecedor: item.ufFornecedor,
       aliquotaInterestadualFornecedor: item.aliquotaInterestadualFornecedor,
       aliquotaInternaFornecedor: item.aliquotaInternaFornecedor,
       atividadeFornecedor: item.atividadeFornecedor,
       nfeCompraFornecedor: item.nfeCompraFornecedor,

       // Distribuidor
       nomeDistribuidor: item.nomeDistribuidor,
       ufDistribuidor: item.ufDistribuidor,
       aliquotaInterestadualDistribuidor: item.aliquotaInterestadualDistribuidor,
       aliquotaInternaDistribuidor: item.aliquotaInternaDistribuidor,
       atividadeDistribuidor: item.atividadeDistribuidor,
       nfeTransferenciaDistribuidor: item.nfeTransferenciaDistribuidor,

       // Varejista
       nomeVarejista: item.nomeVarejista,
       ufVarejista: item.ufVarejista ,
       aliquotaInternaVarejista: item.aliquotaInternaVarejista,
       atividadeVarejista: item.atividadeVarejista,
       nfeVendaVarejista: item.nfeVendaVarejista,

       numeroOs: item.numeroOs,

       // Cliente
       nomeCliente: item.nomeCliente,
       ufCliente: item.ufCliente,
       aliquotaInternaCliente: item.aliquotaInternaCliente,
       atividadeCliente: item.atividadeCliente,
     });
   }





   carregarProdutosSimulados() {
     this.firestore.collection<Produtos>('produtosSimulados', ref =>
       ref
         .where('cabecalhoId', '==', this.cabecalhoId)
         .orderBy('sequencia', 'desc') // Ordena em ordem decrescente
     ).snapshotChanges().subscribe({
       next: snapshot => {
         this.produtosSimulados = snapshot.map(doc => {
           const data = doc.payload.doc.data() as Produtos;
           const id = doc.payload.doc.id;
           return { ...data, id };
         });

         this.tabelaInformacoes = this.produtosSimulados; // Atualiza a tabela

         if (this.produtosSimulados.length > 0) {
           // Lógica adicional, se necessário
         }
       },
       error: err => {
         console.error('Erro ao carregar produtos simulados:', err);
       }
     });
   }




   async salvarCabecalho() {
     const dataCriacao = new Date().toISOString();

     const cabecalho = {
       id: this.cabecalhoId,
       numeroOs: this.simuladorForm.get('numeroOs')?.value,
       finalizado: 'Nao',
       situacao: 'Ativa',
       dataCriacao: dataCriacao,

       // Fornecedor
       nomeFornecedor: this.simuladorForm.get('nomeFornecedor')?.value,
       ufFornecedor: this.simuladorForm.get('ufFornecedor')?.value,
       aliquotaInterestadualFornecedor: this.simuladorForm.get('aliquotaInterestadualFornecedor')?.value,
       aliquotaInternaFornecedor: this.simuladorForm.get('aliquotaInternaFornecedor')?.value,
       atividadeFornecedor: this.simuladorForm.get('atividadeFornecedor')?.value,
       nfeCompraFornecedor: this.simuladorForm.get('nfeCompraFornecedor')?.value,

       // Distribuidor
       nomeDistribuidor: this.simuladorForm.get('nomeDistribuidor')?.value,
       ufDistribuidor: this.simuladorForm.get('ufDistribuidor')?.value,
       aliquotaInterestadualDistribuidor: this.simuladorForm.get('aliquotaInterestadualDistribuidor')?.value,
       aliquotaInternaDistribuidor: this.simuladorForm.get('aliquotaInternaDistribuidor')?.value,
       atividadeDistribuidor: this.simuladorForm.get('atividadeDistribuidor')?.value,
       nfeTransferenciaDistribuidor: this.simuladorForm.get('nfeTransferenciaDistribuidor')?.value,

       //Varejista
       nomeVarejista: this.simuladorForm.get('nomeVarejista')?.value,
       ufVarejista: this.simuladorForm.get('ufVarejista')?.value,
       aliquotaInternaVarejista: this.simuladorForm.get('aliquotaInternaVarejista')?.value,
       atividadeVarejista: this.simuladorForm.get('atividadeVarejista')?.value,
       nfeVendaVarejista: this.simuladorForm.get('nfeVendaVarejista')?.value,

       //Cliente
       nomeCliente: this.simuladorForm.get('nomeCliente')?.value,
       ufCliente: this.simuladorForm.get('ufCliente')?.value,
       aliquotaInternaCliente: this.simuladorForm.get('aliquotaInternaCliente')?.value,
       atividadeCliente: this.simuladorForm.get('atividadeCliente')?.value,
     };
     try {
      await this.firestore.collection('cabecalhoProdutos').doc(this.cabecalhoId).set(cabecalho);



      console.log('Cabeçalho salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar cabeçalho:', error);

      // Registrar log de erro
      await this.loggerService.registrarLog(
        'erro',
        'cabecalhoProdutos',
        this.cabecalhoId,
        null,
        null,
        `Erro ao salvar cabeçalho: ${(error instanceof Error ? error.message : 'Erro desconhecido')}`
      );
    }

    this.carregarProdutosSimulados();
  }





     //Modais
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

         switch (this.tipoCalculoFrete) {
           case 'compra':
             this.simuladorForm.patchValue({
               percentualFreteCompra: `${resultadoFrete.toFixed(5)}`
             });
             break;

           case 'venda':
             this.simuladorForm.patchValue({
               percentualFreteVenda: `${resultadoFrete.toFixed(5)}`
             });
             break;

           case 'transferencia':
             this.simuladorForm.patchValue({
               percentualFreteTransferencia: `${resultadoFrete.toFixed(5)}`
             });
             break;

           default:
             console.warn('Tipo de cálculo de frete desconhecido:', this.tipoCalculoFrete);
         }

         this.closeFreteModal();
       }
     }



   //Listas

   carregarEstados() {
     this.estados = this.aliquotasService.getAllEstados();
   }
   carregarAtividades(){
     this.atividades = this.aliquotasService.atividades;
   }
   carregarBoleanos(){
     this.boleanos = this.aliquotasService.boleanos;
   }
   carregarDadosFornecedor() {
       this.firestore.collection<Fornecedores>('fornecedor', ref =>
         ref.where('tipoDeEmpresa', '==', 'Fornecedor').orderBy('nomeEmpresa')
       )
       .snapshotChanges()
       .subscribe((snapshot) => {
         this.fornecedores = snapshot.map(a => {
           const data = a.payload.doc.data() as Fornecedores;
           const id = a.payload.doc.id;
           return { ...data, id };
         });
       });
   }

   carregarDadosDistribuidor() {
     this.firestore.collection<Fornecedores>('fornecedor', ref =>
       ref
         .where('tipoDeEmpresa', 'in', ['Matriz', 'Filial']) // Corrigido para usar 'in' com os valores desejados
         .orderBy('nomeEmpresa')
     )
     .snapshotChanges()
     .subscribe((snapshot) => {
       this.distribuidores = snapshot.map(a => {
         const data = a.payload.doc.data() as Fornecedores;
         const id = a.payload.doc.id;
         return { ...data, id };
       });
     });
   }
   carregarDadosVarejista() {
     this.firestore.collection<Fornecedores>('fornecedor', ref =>
       ref
         .where('tipoDeEmpresa', 'in', ['Matriz', 'Filial'])
         .orderBy('nomeEmpresa')
     )
     .snapshotChanges()
     .subscribe((snapshot) => {
       this.varejistas = snapshot.map(a => {
         const data = a.payload.doc.data() as Fornecedores;
         const id = a.payload.doc.id;
         return { ...data, id };
       });
     });
   }
   carregarDadosCliente() {
     this.firestore.collection<Fornecedores>('fornecedor', ref =>
       ref
         .where('tipoDeEmpresa', 'in', ['Clientes'])
         .orderBy('nomeEmpresa')
     )
     .snapshotChanges()
     .subscribe((snapshot) => {
       this.clientes = snapshot.map(a => {
         const data = a.payload.doc.data() as Fornecedores;
         const id = a.payload.doc.id;
         return { ...data, id };
       });
     });
   }




   //Atualizadores de campo de aliquotas quando produto importado for alterado

   async atualizarAliquotas(): Promise<void> {

     this.simuladorForm.get('produtoImportado')?.valueChanges.subscribe((produtoImportado) => {
       if (produtoImportado) {
         this.atualizarAliquotaFornecedor();
         this.atualizarAliquotaDistribuidor();
       }
     });
   }

   atualizarAliquotaFornecedor() {
     this.atualizarCamposService.atualizarAliquotaFornecedor(this.simuladorForm);
   }

   atualizarAliquotaDistribuidor() {
     this.atualizarCamposService.atualizarAliquotaDistribuidor(this.simuladorForm);
   }

   atualizarAliquotaVarejista() {
     this.atualizarCamposService.atualizarAliquotaVarejista(this.simuladorForm);
   }
   atualizarAliquotaCliente() {
     this.atualizarCamposService.atualizarAliquotaCliente(this.simuladorForm);
   }


 //Buscar dados Firebase

 buscarNCMData(): void {
   const ncm = this.simuladorForm.get('ncm')?.value;
   const ufDistribuidor = this.simuladorForm.get('ufDistribuidor')?.value;
   const ufVarejista = this.simuladorForm.get('ufVarejista')?.value;
   const cest = this.simuladorForm.get('cest')?.value;

   if (ncm && ncm.length === 8) {
     // Buscar dados para o Distribuidor
     this.buscarNcmService
       .buscarNCMDataDistribuidor(ncm, cest, ufDistribuidor)
       .subscribe(
         (distribuidorData) => {
           if (distribuidorData.length > 0) {

             const ncmDataDistribuidor = distribuidorData[0];

             // Preencher dados do distribuidor
             this.simuladorForm.patchValue({
               cest: ncmDataDistribuidor.cest,
               percentualMVA: ncmDataDistribuidor.percentualMVA,
               dadosDistribuidoraliquotacofinsSaida: ncmDataDistribuidor.aliquotacofinsSaida,
               dadosDistribuidoraliquotapisSaida: ncmDataDistribuidor.aliquotapisSaida,
               dadosDistribuidorcst: ncmDataDistribuidor.cst,
               dadosDistribuidoraliquotaicms: ncmDataDistribuidor.aliquotaicms,
               dadosDistribuidormvaOriginal: ncmDataDistribuidor.mvaOriginal,
               dadosDistribuidormvaAliquota12: ncmDataDistribuidor.mvaAliquota12,
               dadosDistribuidormvaAliquota7: ncmDataDistribuidor.mvaAliquota7,
               dadosDistribuidormvaAliquota4: ncmDataDistribuidor.mvaAliquota4,
               dadosDistribuidorirpj: ncmDataDistribuidor.irpj,
               dadosDistribuidorcsll: ncmDataDistribuidor.csll,
             });
             this.atualizarAliquotasVarejista();
               // Atualizar as opções do CEST
               this.cestOptions = [{
                 cest: ncmDataDistribuidor.cest
               }];

           } else {
             console.log('NCM não encontrado para o Distribuidor');
             this.showAlertForNcmDistribuidor();
           }
         },
         (error) => {
           console.error('Erro ao buscar dados do Distribuidor:', error);
         }
       );

     // Buscar dados para o Varejista
     this.buscarNcmService
       .buscarNCMDataVarejista(ncm, ufVarejista)
       .subscribe(
         (varejistaData) => {
           if (varejistaData.length > 0) {

             const ncmDataVarejista = varejistaData[0];

             // Atualizar os campos do formulário
             this.simuladorForm.patchValue({
               cest: ncmDataVarejista.cest,
               percentualMVA: ncmDataVarejista.percentualMVA,
               dadosVarejistacst: ncmDataVarejista.cst,
               dadosVarejistaaliquotacofinsSaida: ncmDataVarejista.aliquotacofinsSaida,
               dadosVarejistaaliquotapisSaida: ncmDataVarejista.aliquotapisSaida,
               dadosVarejistaaliquotaicms: ncmDataVarejista.aliquotaicms,


               dadosVarejistamvaOriginal: ncmDataVarejista.mvaOriginal,
               dadosVarejistamvaAliquota12: ncmDataVarejista.mvaAliquota12,
               dadosVarejistamvaAliquota7: ncmDataVarejista.mvaAliquota7,
               dadosVarejistamvaAliquota4: ncmDataVarejista.mvaAliquota4,
               dadosVarejistairpj: ncmDataVarejista.irpj,
               dadosVarejistacsll: ncmDataVarejista.csll,
             });
             this.atualizarAliquotasVarejista();
           } else {
             console.log('NCM não encontrado para o Varejista');
             this.showAlertForNcmVarejista();
           }
         },
         (error) => {
           console.error('Erro ao buscar dados do Varejista:', error);
         }
       );
   } else {
     console.error('NCM inválido ou incompleto');
   }
 }

 buscarCestData() {
   const ncm = this.simuladorForm.get('ncm')?.value;
   const ufDistribuidor = this.simuladorForm.get('ufDistribuidor')?.value;


   if (!ncm || !ufDistribuidor) {
     return; // Retorna se os campos obrigatórios não estiverem preenchidos
   }

   this.firestore
     .collection<NCMs>('ncm', (ref) =>
       ref
         .where('ncm', '==', ncm)
         .where('uf', '==', ufDistribuidor)
         .orderBy('uf')
     )
     .snapshotChanges()
     .subscribe(
       (snapshot) => {
         this.cestOptions = []; // Limpa as opções anteriores

         snapshot.forEach((a) => {
           const data = a.payload.doc.data() as NCMs;
           const id = a.payload.doc.id;

           if (data.cest) {
             this.cestOptions.push({ cest: data.cest, id });



           }
         });

       },
       (error) => {
         console.error('Erro ao buscar CEST:', error); // Registra o erro no console
       }
     );
 }



 async adicionarNaTabela() {
  if (!this.simuladorForm.valid) {
    this.mostrarErrosFormulario(); // Não await aqui
    return;
  }

  try {
    const formData = this.prepararDadosParaInsercao();

    // Operações assíncronas sem bloquear a UI
    const saveOperations = Promise.all([
      this.salvarCabecalho(),
      this.inserirProdutoNoFirestore(formData)
    ]);

    // Atualização imediata da UI
    this.atualizarTabelaLocal(formData);

    // Feedback não-bloqueante
    this.enqueueToast({
      message: 'Produto adicionado com sucesso!',
      duration: 500, // Mais rápido
      color: 'success'
    });

    await saveOperations; // Aguarda apenas as operações críticas

  } catch (error) {
    console.error('Erro ao salvar Produto:', error);
    this.enqueueToast({
      message: 'Erro ao salvar Produto!',
      duration: 800,
      color: 'danger'
    });
  }
}
 private async enqueueToast(options: any) {
   const toast = await this.toastController.create(options);
   this.toastQueue.push(toast);

   if (!this.isShowingToast) {
     this.processToastQueue();
   }
 }

 private async processToastQueue() {
   if (this.toastQueue.length === 0) {
     this.isShowingToast = false;
     return;
   }

   this.isShowingToast = true;
   const toast = this.toastQueue.shift()!;

   toast.onDidDismiss().then(() => {
     setTimeout(() => this.processToastQueue(), 100); // Pequeno delay entre toasts
   });

   await toast.present();
 }
 // Métodos auxiliares divididos para melhor organização e reuso
 private prepararDadosParaInsercao(): any {
   const formData = this.simuladorForm.value;
   formData.cabecalhoId = this.cabecalhoId;
   formData.dataHoraInsercao = new Date().toISOString();
   formData.sequencia = this.tabelaInformacoes.length + 1;
   return formData;
 }

 private async inserirProdutoNoFirestore(formData: any): Promise<void> {
  try {
    const docRef = await this.firestore.collection('produtosSimulados').add(formData);

    // Registrar log da criação do produto
    await this.loggerService.registrarLog(
      'criacao',
      'produtosSimulados',
      docRef.id,
      formData
    );
  } catch (error) {
    console.error('Erro ao salvar produto:', error);

    // Registrar log de erro
    await this.loggerService.registrarLog(
      'erro',
      'produtosSimulados',
      'novo',
      null,
      null,
      `Erro ao salvar produto: ${(error instanceof Error ? error.message : 'Erro desconhecido')}`
    );

    throw error; // Re-lança o erro para ser tratado no método chamador
  }
}


 private atualizarTabelaLocal(formData: any): void {
   this.tabelaInformacoes = [...this.tabelaInformacoes, formData];
 }

 private async mostrarFeedbackSucesso(): Promise<void> {
   const toast = await this.toastController.create({
     message: 'Produto adicionado com sucesso!',
     duration: 1000,
     color: 'success',
   });
   await toast.present();
 }

 private async mostrarFeedbackErro(): Promise<void> {
   const toast = await this.toastController.create({
     message: 'Erro ao salvar Produto!',
     duration: 1000,
     color: 'danger',
   });
   await toast.present();
 }

 private async mostrarErrosFormulario(): Promise<void> {

   const invalidControls = [];
   for (const name in this.simuladorForm.controls) {
     if (this.simuladorForm.controls[name].invalid) {
       let label = name.replace(/([A-Z])/g, ' $1').trim();
       label = label.charAt(0).toUpperCase() + label.slice(1);
       if (label.includes('Fornecedor')) {
         label = label.replace('Fornecedor', '').trim();
       } else if (label.includes('Distribuidor')) {
         label = label.replace('Distribuidor', '').trim();
       } else if (label.includes('Varejista')) {
         label = label.replace('Varejista', '').trim();
       }
       invalidControls.push(label);
     }
   }

   this.enqueueToast({
     message: `Por favor, preencha: ${invalidControls.join(', ')}`,
     duration: 1500,
     color: 'warning'
   });
 }

 //Alertas para o usuário
 async showAlertForNcmVarejista() {
   const alert = await this.alertController.create({
     header: 'NCM Não Encontrado',
     message: 'O NCM não foi cadastrado para UF Varejista. Deseja cadastrar agora?',
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

 async showAlertForNcmDistribuidor() {
   const alert = await this.alertController.create({
     header: 'NCM Não Encontrado',
     message: 'O NCM não foi cadastrado para UF Distribuidora. Deseja cadastrar agora?',
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


 ///Preencher Campos
 selectedItem: any = null; // Armazena os dados para edição


 preencherFormularioComDados(dados: any) {
   const item = dados.item;
   this.simuladorForm.patchValue({
     // Fornecedor
     nomeFornecedor: item.nomeFornecedor,
     ufFornecedor: item.ufFornecedor,
     aliquotaInterestadualFornecedor: item.aliquotaInterestadualFornecedor,
     aliquotaInternaFornecedor: item.aliquotaInternaFornecedor,
     atividadeFornecedor: item.atividadeFornecedor,
     nfeCompraFornecedor: item.nfeCompraFornecedor,

     // Distribuidor
     nomeDistribuidor: item.nomeDistribuidor,
     ufDistribuidor: item.ufDistribuidor,
     aliquotaInterestadualDistribuidor: item.aliquotaInterestadualDistribuidor,
     aliquotaInternaDistribuidor: item.aliquotaInternaDistribuidor,
     atividadeDistribuidor: item.atividadeDistribuidor,
     nfeTransferenciaDistribuidor: item.nfeTransferenciaDistribuidor,

     // Varejista
     nomeVarejista: item.nomeVarejista,
     ufVarejista: item.ufVarejista,
     aliquotaInternaVarejista: item.aliquotaInternaVarejista,
     atividadeVarejista: item.atividadeVarejista,
     nfeVendaVarejista: item.nfeVendaVarejista,

     // Cliente
     nomeCliente: item.nomeCliente,
     ufCliente: item.ufCliente,
     aliquotaInternaCliente: item.aliquotaInternaCliente,
     atividadeCliente: item.atividadeCliente,

     // Valores Predeterminados
     percentualMargem: item.percentualMargem,
     percentualDesconto: item.percentualDesconto,
     percentualTaxas: item.percentualTaxas,
     comissaoVarejista: item.comissaoVarejista,
     comissaoDistribuidor: item.comissaoDistribuidor,
     percentualFreteCompra: item.percentualFreteCompra,
     percentualFreteVenda: item.percentualFreteVenda,
     percentualFreteTransferencia: item.percentualFreteTransferencia,

     // Produtos
     nomeProduto: item.nomeProduto,

     numeroOs: item.numeroOs,
     quantidadeProduto: item.quantidadeProduto,
     valorCompraProdutoUnitario: item.valorCompraProdutoUnitario,
     produtoImportado: item.produtoImportado,
     produtoEstoque: item.produtoEstoque,
     consumidorFinal: item.consumidorFinal,
     ncm: item.ncm,
     cest: item.cest,
   });
 }

 async preencherCamposFornecedor(nomeEmpresa: string){
   const fornecedorSelecionado = this.fornecedores.find(c => c.nomeEmpresa === nomeEmpresa);
   if (fornecedorSelecionado) {
     this.simuladorForm.patchValue({
       ufFornecedor: fornecedorSelecionado.estado,
       atividadeFornecedor: fornecedorSelecionado.atividadeFornecedor,
       nfeCompraFornecedor: fornecedorSelecionado.nfeCompraFornecedor,
     });
     this.atualizarAliquotaFornecedor();

   }
 }

 async preencherCamposDistribuidor(nomeEmpresa: string){
   const distribuidorSelecionado = this.distribuidores.find(c => c.nomeEmpresa === nomeEmpresa);
   if (distribuidorSelecionado) {
     this.simuladorForm.patchValue({
       ufDistribuidor: distribuidorSelecionado.estado,
       atividadeDistribuidor: distribuidorSelecionado.atividadeFornecedor,
       nfeTransferenciaDistribuidor: distribuidorSelecionado.nfeCompraFornecedor,
     });

   }
   this.atualizarAliquotaDistribuidor();
 }
 async preencherCamposVarejista(nomeEmpresa: string){
   const varejistaSelecionado = this.distribuidores.find(c => c.nomeEmpresa === nomeEmpresa);
   if (varejistaSelecionado) {
     this.simuladorForm.patchValue({
       ufVarejista: varejistaSelecionado.estado,
       atividadeVarejista: varejistaSelecionado.atividadeFornecedor,
       nfeVendaVarejista: varejistaSelecionado.nfeCompraFornecedor,
     });

   }
   this.atualizarAliquotaVarejista();
 }

 async preencherCamposCliente(nomeEmpresa: string) {
   const clienteSelecionado = this.clientes.find(c => c.nomeEmpresa === nomeEmpresa);
   if (clienteSelecionado) {
     this.simuladorForm.patchValue({
       ufCliente: clienteSelecionado.estado,
       atividadeCliente: clienteSelecionado.atividadeFornecedor,
     });
     this.atualizarAliquotaCliente();
   }
 }


 //Teclas de atalho
 onKeyDown(event: KeyboardEvent): void {
   if (event.key === 'F2') {
     this.adicionarNaTabela();
   }
 }

 verificarDistribuidor(nomeVarejistaSelecionado: string) {
   const nomeDistribuidorSelecionado = this.simuladorForm.get('nomeDistribuidor')?.value;

   if (nomeVarejistaSelecionado === nomeDistribuidorSelecionado) {
     this.simuladorForm.get('nfeTransferenciaDistribuidor')?.setValue('Não');
   }
 }

 async abrirModalFornecedor() {
   const modal = await this.modalController.create({
     component: CriarComponent,
     componentProps: {
       // se quiser passar dados, use isso:
       // fornecedorAtual: this.form.get('nomeFornecedor')?.value
     }
   });

   await modal.present();

   // Captura o retorno quando o modal for fechado
   const { data } = await modal.onDidDismiss();
   if (data) {
     console.log('Dados retornados do modal:', data);
     // ex: this.preencherCamposFornecedor(data.nome);
   }
 }
   async modalCadastrarNCM(){
   const modal = await this.modalController.create({
     component: CadastroPage,
     componentProps: {
       // se quiser passar dados, use isso:
       // fornecedorAtual: this.form.get('nomeFornecedor')?.value
     }
   });

   await modal.present();

   // Captura o retorno quando o modal for fechado
   const { data } = await modal.onDidDismiss();
   if (data) {
     console.log('Dados retornados do modal:', data);
     // ex: this.preencherCamposFornecedor(data.nome);
   }
 }
 setActiveTab(tab: string): void {
   this.activeTab = tab;
 }


 atualizarAliquotasVarejista(): void {
   const form = this.simuladorForm;

   const ufVarejista = form.get('ufVarejista')?.value;
   const ufCliente = form.get('ufCliente')?.value;
   const atividadeCliente = form.get('atividadeCliente')?.value;
   const produtoImportado = form.get('produtoImportado')?.value;
   const aliquotaInternaCliente = form.get('aliquotaInternaCliente')?.value;

   // Valor original da alíquota (ex: buscado via NCM)
   const aliquotaNormalProduto = form.get('dadosVarejistaaliquotaicms')?.value;

   let novaAliquotaIcms = aliquotaNormalProduto;
   let novaAliquotaDifal = 0;

   const isInterestadualConsumidorFinal = ufVarejista !== ufCliente && atividadeCliente === 'Consumidor Final';

   if (isInterestadualConsumidorFinal) {
     novaAliquotaIcms = (produtoImportado === 'Sim') ? 4 : 12;

     if (aliquotaInternaCliente != null) {
       novaAliquotaDifal = aliquotaInternaCliente - novaAliquotaIcms;
     }
   }

   form.get('dadosVarejistaaliquotaicms')?.setValue(novaAliquotaIcms);
   form.get('dadosVarejistaaliquotaDifal')?.setValue(novaAliquotaDifal);
 }



 }
