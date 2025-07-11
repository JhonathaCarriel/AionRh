import { Boleanos } from '../../fornecedores/criar/criar.component';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AlertController, IonicModule, ModalController, ToastController } from '@ionic/angular';
import { BotaoFlutuanteComponent } from 'src/app/botao-flutuante/botao-flutuante.component';
import { DetalhesNcmComponent } from './detalhes-ncm/detalhes-ncm.component';


import * as XLSX from 'xlsx';
import { AliquotasService } from 'src/app/services/aliquotas.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import {jsPDF} from 'jspdf'
import "jspdf-autotable";
declare module 'jspdf' {
  interface jsPDF {
    autoTable: any;
    autoTableEndPosY: any; // Add this line to extend jsPDF with autoTable
  }
}
import JsBarcode from 'jsbarcode';
import { LoggerService } from 'src/app/services/logger.service';


// Interface para tipagem dos dados editáveis
interface DadosEditaveis {
  nomeProduto: string;
  quantidadeProduto: number;
  valorCompraProdutoUnitario: number;
  percentualMargem: number;
  percentualDesconto: number;
  aliquotaInterestadualFornecedor: number;
  dadosVarejistaaliquotaicms: string;
  produtoEstoque: string;
  nfeTransferenciaDistribuidor: string;
  nfeCompraFornecedor: string;
  nfeVendaVarejista: string;
  [key: string]: any; // Para outras propriedades que não serão editadas
}

export interface DadosTabela{
  id: string,
  cabecalhoId?: string, // Added the missing property
 // Fornecedor
 naoVender: Boleanos,
 nomeFornecedor: string,
 ufFornecedor:string,
 aliquotaInterestadualFornecedor: number,
 aliquotaInternaFornecedor:number,
 atividadeFornecedor: string,
 nfeCompraFornecedor: string,

 // Distribuidor
 nomeDistribuidor: string,
 ufDistribuidor: string,
 aliquotaInterestadualDistribuidor: number,
 aliquotaInternaDistribuidor: number,
 atividadeDistribuidor: string,
 nfeTransferenciaDistribuidor: string,

 // Varejista
 nomeVarejista: string,
 ufVarejista: string,
 aliquotaInternaVarejista:number,
 atividadeVarejista: string,
 nfeVendaVarejista: string,

 // Valores Predeterminados
 percentualMargem: number,
 percentualDesconto: number,
 percentualTaxas:number,
 comissaoVarejista:number,
 comissaoDistribuidor:number,
 percentualFreteCompra:number,
 percentualFreteVenda:number,
 percentualFreteTransferencia:number,

 // Produtos
 nomeProduto: string,
 nomeCliente: string,
 numeroOs: string,
 quantidadeProduto: number,
 valorCompraProdutoUnitario: number,
 produtoImportado: string,
 produtoEstoque: string,
 ncm: string,
 cest: string,
 percentualMVA: string,
 cst: string,

 //Dados NCM Varejista
 dadosVarejistacst: string,
 dadosVarejistaaliquotacofinsSaida: number,
 dadosVarejistaaliquotaDifal: number,
 dadosVarejistaaliquotapisSaida:number,
 dadosVarejistaaliquotaicms: string,
 dadosVarejistamvaOriginal: number,
 dadosVarejistamvaAliquota12:number,
 dadosVarejistamvaAliquota7: number,
 dadosVarejistamvaAliquota4: number,
 dadosVarejistairpj: number,
 dadosVarejistacsll:number,

 //Dados NCM Distribuidor
 dadosDistribuidoraliquotacofinsSaida: number,
 dadosDistribuidoraliquotapisSaida:  number,
 dadosDistribuidorcst:  string,
 dadosDistribuidoraliquotaicms:  string,
 dadosDistribuidormvaOriginal: number,
 dadosDistribuidormvaAliquota12:  number,
 dadosDistribuidormvaAliquota7:  number,
 dadosDistribuidormvaAliquota4: number,
 dadosDistribuidorirpj: number,
 dadosDistribuidorcsll:number,


 editando?: boolean;
 sequencia?: number;
 sequenciaOriginal?: number;
 consumidorFinal: string;


}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    BotaoFlutuanteComponent

  ],
  selector: 'app-tabelaprodutos',
  templateUrl: './tabela.component.html',
  styleUrls: ['./tabela.component.scss'],
})
export class TabelaComponent  implements OnInit {

  @Input() dadosTabela: DadosTabela[] = [];
  @Input() simuladorForm: FormGroup;
  @Output() editar = new EventEmitter<any>();  // Emite os dados para a página
  servicoId: string =''
  cabecalhoId: string =''

  copiaEditavel: Partial<DadosTabela> | null = null;


  //Exibir campos
  exibir: Boolean = false;





  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    public aliquotasService: AliquotasService,
    public alertController: AlertController,
    public toastController: ToastController,
    private route: ActivatedRoute,
    private loggerService: LoggerService,

    public firestore: AngularFirestore,
  ) {
    this.simuladorForm = this.formBuilder.group({
      // Fornecedor
      nomeFornecedor: [''],
      ufFornecedor: [''],
      aliquotaInterestadualFornecedor: [],
      aliquotaInternaFornecedor: [],
      atividadeFornecedor: [''],
      nfeCompraFornecedor: [''],

      // Distribuidor
      nomeDistribuidor: [''],
      ufDistribuidor: [''],
      aliquotaInterestadualDistribuidor: [],
      aliquotaInternaDistribuidor: [''],
      atividadeDistribuidor: [''],
      nfeTransferenciaDistribuidor: [''],

      // Varejista
      nomeVarejista: [''],
      ufVarejista: [''],
      atividadeVarejista: [''],
      aliquotaInternaVarejista:[],
      nfeVendaVarejista: [''],

      // Valores Predeterminados
      percentualMargem: [],
      percentualDesconto:  [],
      percentualTaxas: [],
      comissaoVarejista:  [],
      comissaoDistribuidor:  [],
      percentualFreteCompra:  [],
      percentualFreteVenda:  [],
      percentualFreteTransferencia: [],

      // Produtos
      nomeProduto: [''],
      nomeCliente: [''],
      numeroOs: [''],
      quantidadeProduto: [''],
      valorCompraProdutoUnitario: [''],
      produtoImportado: [''],
      produtoEstoque: [''],
      ncm: [''],
      cest: [''],
      percentualMVA: [''],
      cst: [''],
       //Dados NCM Varejista
       dadosVarejistacst: [''],
       dadosVarejistaaliquotacofinsSaida: [],
       dadosVarejistaaliquotaDifal: [],
       dadosVarejistaaliquotapisSaida:[],
       dadosVarejistaaliquotaicms:[''],
       dadosVarejistamvaOriginal: [],
       dadosVarejistamvaAliquota12: [],
       dadosVarejistamvaAliquota7: [],
       dadosVarejistamvaAliquota4: [],
       dadosVarejistairpj: [],
       dadosVarejistacsll:[],

       //Dados NCM Distribuidor
       dadosDistribuidoraliquotacofinsSaida:  [],
       dadosDistribuidoraliquotapisSaida:  [],
       dadosDistribuidorcst:  [''],
       dadosDistribuidoraliquotaicms:  [''],
       dadosDistribuidormvaOriginal: [],
       dadosDistribuidormvaAliquota12:  [],
       dadosDistribuidormvaAliquota7:  [],
       dadosDistribuidormvaAliquota4: [],
       dadosDistribuidorirpj: [],
       dadosDistribuidorcsll: [],

       naoVender: [false],
    });

   }

  ngOnInit() {
    this.servicoId = this.route.snapshot.paramMap.get('id')!;
    this.cabecalhoId = this.route.snapshot.paramMap.get('id')!;
    this.ordenarPorSequencia();
  }

  getNumber(value: any): number {
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
      return isNaN(parsed) ? 0 : parsed;
    }
    return typeof value === 'number' ? value : 0;
  }

  toggleCampos() {


if (this.exibir) {

} else {

}
}



  //Modais
  async modalCargaTributariaNCMCompra(item: DadosTabela) {

  }
  modalCarregarCalculoICMSST(item: DadosTabela){

  }



  async removeItem(item: DadosTabela, index: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja remover o produto "${item.nomeProduto}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Remover',
          handler: async () => {
            try {
              // 1. Registrar log antes da exclusão (com dados completos)
              await this.loggerService.registrarLog(
                'exclusao',
                'produtosSimulados',
                item.id,
                null, // Não há dados novos
                item, // Dados antigos (o produto que será removido)
                'Produto removido pelo usuário'
              );

              // 2. Executar a exclusão no Firestore
              await this.firestore.collection('produtosSimulados').doc(item.id).delete();

              // 3. Feedback visual
              const toast = await this.toastController.create({
                message: 'Produto removido com sucesso!',
                duration: 2000,
                color: 'success'
              });
              await toast.present();

            } catch (error) {
              console.error('Erro ao remover produto:', error);

              // Registrar log de erro
              await this.loggerService.registrarLog(
                'erro',
                'produtosSimulados',
                item.id,
                null,
                null,
                `Falha ao remover produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
              );

              const toast = await this.toastController.create({
                message: 'Erro ao remover produto!',
                duration: 2000,
                color: 'danger'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async editarItem(item: DadosTabela, index: number) {
    try {

      this.editar.emit({ item, index });


      const formData = {
        dadosAntigos: item,
        dadosNovos: null
      };


      await this.loggerService.registrarLog(
        'atualizacao',
        'produtosSimulados',
        item.id,
        formData
      );


      this.dadosTabela.splice(index, 1);

    } catch (error) {
      console.error('Erro durante a edição:', error);
      if (error instanceof Error) {
        alert('Erro ao editar Produto: ' + error.message);
      } else {
        alert('Erro ao editar Produto: Erro desconhecido');
      }
    }
  }

  //Cálculos
  calculoValorCompraUnitarioXQuantidadeProduto(item: DadosTabela): number{
    const valorCompra = item.quantidadeProduto * item.valorCompraProdutoUnitario;
    return valorCompra;
  }
  calcularValorFreteCompra(item: DadosTabela): number{
    const valorCompra = item.quantidadeProduto * item.valorCompraProdutoUnitario;
    const frete = (item.percentualFreteCompra / 100) || 0;
    return valorCompra * frete;
  }

  calcularValorFreteTransferencia(item: DadosTabela): number{
    const valorCompra = item.quantidadeProduto * item.valorCompraProdutoUnitario;
    const frete = (item.percentualFreteTransferencia / 100) || 0;
    return valorCompra * frete;
  }
  calcularValorCompraTotalComValorFrete(item: DadosTabela): number{
    const valorFrete = ((item.percentualFreteCompra / 100) * (item.quantidadeProduto * item.valorCompraProdutoUnitario)) + (item.quantidadeProduto * item.valorCompraProdutoUnitario);
    return valorFrete;
  }
  calcularValorCompraTotalComValorFreteTransferencia(item: DadosTabela): number{
    const valorFrete = ((item.percentualFreteTransferencia / 100) * (item.quantidadeProduto * item.valorCompraProdutoUnitario)) + (item.quantidadeProduto * item.valorCompraProdutoUnitario);
    return valorFrete;
  }
  calcularIcmsCompra(item: DadosTabela): number{
    if(item.produtoEstoque === 'Sim' && item.nfeTransferenciaDistribuidor === 'Não'){
      return 0;
    }
    const valorCompra = this.calcularValorCompraTotalComValorFrete(item);
    const aliquotaInterestadualFornecedor = item.aliquotaInterestadualFornecedor;
    return valorCompra * (aliquotaInterestadualFornecedor/100);

  }
IcmsCompra(item: DadosTabela): number{
  if(item.produtoEstoque === 'Sim' && item.nfeTransferenciaDistribuidor === 'Não'){
    return 0;
  }
  if (item.dadosDistribuidorcst === '00') {
    const valorCompra = this.calcularValorCompraTotalComValorFrete(item);
    const aliquotaInterestadualFornecedor = item.aliquotaInterestadualFornecedor;
    return valorCompra * (aliquotaInterestadualFornecedor/100);
  }else{
    return 0;
  }


  }
  calcularIcmsTransferencia(item: DadosTabela): number{

    const ufDistribuidor = item.ufDistribuidor;
    const ufFornecedor = item.ufFornecedor;
    const ufVarejista = item.ufVarejista;
    const nfeTransferenciaDistribuidor = item.nfeTransferenciaDistribuidor;

    if(nfeTransferenciaDistribuidor === 'Sim'){
    const valorCompra = this.calcularValorCompraTotalComValorFreteTransferencia(item);
    const aliquotaInterestadualDistribuidor = item.aliquotaInterestadualDistribuidor;
    return valorCompra * (aliquotaInterestadualDistribuidor/100);

    }else{
      return 0;

    }


  }
  IcmsTransferencia(item: DadosTabela): number{
       if (item.dadosDistribuidorcst === '00') { // Corrigida a comparação
    const valorCompra = this.calcularValorCompraTotalComValorFreteTransferencia(item);
    const aliquotaInterestadualDistribuidor = item.aliquotaInterestadualDistribuidor;
    return valorCompra * (aliquotaInterestadualDistribuidor/100);}
    else{
      return 0;
    }

  }
  calcularBaseIcmsStVarejista(item: DadosTabela): number{
    if(item.produtoEstoque === 'Sim' && item.nfeTransferenciaDistribuidor === 'Não'){
      return 0;
    }
    const buscarMVAVarejista = this.buscarMVAVarejista(item)
    const valorCompra = this.calcularValorCompraTotalComValorFreteTransferencia(item);

    return (valorCompra * (buscarMVAVarejista/100) + valorCompra);
  }
  calcularBaseIcmsStDistribuidor(item: DadosTabela): number{
    if(item.produtoEstoque === 'Sim' && item.nfeTransferenciaDistribuidor === 'Não'){
      return 0;
    }
    const valorCompra = this.calcularValorCompraTotalComValorFrete(item);
    const buscarMVADistribuidor = this.buscarMVADistribuidor(item)
    return (valorCompra * (buscarMVADistribuidor/100) + valorCompra);
  }
  calcularDebitoICMSST(item: DadosTabela): number{
    if(item.produtoEstoque === 'Sim' && item.nfeTransferenciaDistribuidor === 'Não'){
      return 0;
    }
    const aliquotaInterna = item.aliquotaInternaDistribuidor;
    const baseICMSST = this.calcularBaseIcmsStDistribuidor(item);
    const debito = (baseICMSST * (aliquotaInterna/100))
    return debito;
  }
  calcularDebitoICMSSTVarejista(item: DadosTabela): number{
    if(item.produtoEstoque === 'Sim' && item.nfeTransferenciaDistribuidor === 'Não'){
      return 0;
    }
    const aliquotaInterna = item.aliquotaInternaVarejista;
    const baseICMSST = this.calcularBaseIcmsStVarejista(item);
    const debito = (baseICMSST * (aliquotaInterna/100))
    return debito;
  }
  calcularDiferencaICMSSTeICMSInterestadual(item: DadosTabela): number {
    if(item.produtoEstoque === 'Sim' && item.nfeTransferenciaDistribuidor === 'Não'){
      return 0;
    }
    const tipoFornecedor = item.atividadeFornecedor;
    const nfeCompra = item.nfeCompraFornecedor;
    const cstDistribuidor = item.dadosDistribuidorcst;
    const ufFornecedor = item.ufFornecedor;
    const produtoImportado = item.produtoImportado;
    const dadosDistribuidoraliquotaicms = item.dadosDistribuidoraliquotaicms;
    const ufDistribuidor = item.ufDistribuidor;
    const aliquotaInternaDistribuidor = item.aliquotaInternaDistribuidor;

    // Verifica se o fornecedor e o distribuidor estão no mesmo estado
    if (ufFornecedor === ufDistribuidor) {
      return 0;
    }

    // Verifica se o fornecedor é uma indústria
    if (tipoFornecedor === 'Indústria') {
      return 0;
    }

    // Verifica se a nota fiscal de compra foi emitida
    if (nfeCompra === 'Não') {
      return 0;
    }

    // Obtém a alíquota de ICMS/ST para o distribuidor
    const AliquotaICMSATDistribuidor = this.aliquotasService.getAliquotaICMSATDistribuidor(
      ufFornecedor,
      dadosDistribuidoraliquotaicms,
      produtoImportado,
      aliquotaInternaDistribuidor
    );

    // Verifica se o CST do distribuidor é '00'
    if (cstDistribuidor === '00') {
      const valorCompra = this.calcularValorCompraTotalComValorFrete(item);
      return valorCompra * (AliquotaICMSATDistribuidor / 100);
    }

    // Calcula o débito de ICMS/ST e o ICMS da compra
    const debitoICMSST = this.calcularDebitoICMSST(item);
    const calculateIcmsCompra = this.calcularIcmsCompra(item);

    // Retorna a diferença entre o débito de ICMS/ST e o ICMS da compra
    return debitoICMSST - calculateIcmsCompra;
  }
  calcularDiferencaICMSSTeICMSInterestadualVarejista(item: DadosTabela): number{
    if(item.produtoEstoque === 'Sim' && item.nfeTransferenciaDistribuidor === 'Não'){
      return 0;
    }
    const atividadeDistribuidor = item.atividadeDistribuidor;
    const nfeTransferenciaDistribuidor = item.nfeTransferenciaDistribuidor;
    const cstVarejista = item.dadosVarejistacst;
    const ufDistribuidor = item.ufDistribuidor;
    const dadosVarejistaaliquotaicms = item.dadosVarejistaaliquotaicms;
    const ufVarejista = item.ufVarejista;
    const produtoImportado = item.produtoImportado;
    const aliquotaInternaVarejista = item.aliquotaInternaVarejista;

    if (ufDistribuidor === ufVarejista) {
      return 0;
    }

    if (atividadeDistribuidor === 'Indústria') {
      return 0;
    }
    if (nfeTransferenciaDistribuidor === 'Não') {
      return 0;
    }
    // Obtém a alíquota de ICMS/ST para o distribuidor
    const AliquotaICMSATVarejista = this.aliquotasService.getAliquotaICMSATVarejista(
      ufDistribuidor,
      dadosVarejistaaliquotaicms,
      produtoImportado,
      aliquotaInternaVarejista
    );

    // Verifica se o CST do Varejista é '00'
    if (cstVarejista === '00') {
      const valorCompra = this.calcularValorCompraTotalComValorFreteTransferencia(item);
      return valorCompra * (AliquotaICMSATVarejista / 100);
    }

    const debitoICMSST = this.calcularDebitoICMSSTVarejista(item);
    const calculateIcmsCompra = this.calcularIcmsTransferencia(item);
    return debitoICMSST - calculateIcmsCompra;
  }
  calcularCustoUn(item: DadosTabela): number {
    const quantidadeProduto = item.quantidadeProduto;
    const nfeTransferenciaDistribuidor = item.nfeTransferenciaDistribuidor;
    const icmsTransferencia = this.calcularIcmsTransferencia(item);

    // Calculando os valores
    const calcularValorCompraTotalComValorFrete = this.calcularValorCompraTotalComValorFrete(item);
    const diferencaICMSSTeICMSInterestadual = this.calcularDiferencaICMSSTeICMSInterestadual(item);
    const calcularValorCompraTotalComValorFreteTransferencia = this.calcularValorCompraTotalComValorFreteTransferencia(item);
    const diferencaICMSSTeICMSInterestadualVarejista = this.calcularDiferencaICMSSTeICMSInterestadualVarejista(item);


    // Cálculo do custo unitário
    let custoUnitario: number;

    if (nfeTransferenciaDistribuidor === 'Não') {
      custoUnitario = (calcularValorCompraTotalComValorFrete + diferencaICMSSTeICMSInterestadual) / quantidadeProduto;

    } else {
      custoUnitario = (calcularValorCompraTotalComValorFreteTransferencia + diferencaICMSSTeICMSInterestadualVarejista + icmsTransferencia) / quantidadeProduto;

    }

    return custoUnitario;
  }


  calculoCustoTotal(item: DadosTabela): number {
    const quantidadeProduto = item.quantidadeProduto;
    const nfeTransferenciaDistribuidor = item.nfeTransferenciaDistribuidor;
    const icmsTransferencia = this.calcularIcmsTransferencia(item);

    const valorCompra = this.calculoValorCompraUnitarioXQuantidadeProduto(item);
    const freteCompra = (item.percentualFreteCompra || 0) / 100;
    const valorFreteCompra = valorCompra * freteCompra;

    const valorComFrete = this.calcularValorCompraTotalComValorFrete(item);
    const valorComFreteTransferencia = this.calcularValorCompraTotalComValorFreteTransferencia(item);

    const icmsSTCompra = this.calcularDiferencaICMSSTeICMSInterestadual(item);
    const icmsSTTransferencia = this.calcularDiferencaICMSSTeICMSInterestadualVarejista(item);



    let custoUnitario: number;

    if (nfeTransferenciaDistribuidor === 'Não') {
      custoUnitario = valorComFrete + icmsSTCompra;
    } else {
      custoUnitario = valorComFreteTransferencia + valorFreteCompra + icmsSTTransferencia + icmsTransferencia;
    }

    return custoUnitario;
  }


  calcularValorVendaUnSemDesconto(item: DadosTabela): number{
    const valorCustoUn = this.calcularCustoUn(item);
    const margem = item.percentualMargem;
    return (valorCustoUn * (margem/100)) + valorCustoUn
  }
  calcularValorVendaTotalSemDesconto(item: DadosTabela): number{
    const valorCustoUn = this.calcularCustoUn(item);
    const quantidadeProduto = item.quantidadeProduto;
    const margem = item.percentualMargem;
    return ((valorCustoUn * (margem/100)) + valorCustoUn)*quantidadeProduto
  }
  calcularValorVendaUnComDesconto(item: DadosTabela): number{
    const ValorVendaUnSemDesconto = this.calcularValorVendaUnSemDesconto(item);
    const desconto = item.percentualDesconto;
    return (ValorVendaUnSemDesconto - (ValorVendaUnSemDesconto * (desconto/100)))
  }
  calcularValorVendaTotalComDesconto(item: DadosTabela): number{
      const ValorVendaTotalSemDesconto = this.calcularValorVendaTotalSemDesconto(item);
      const desconto = item.percentualDesconto;
      return (ValorVendaTotalSemDesconto- (ValorVendaTotalSemDesconto * (desconto/100)))

  }
  calcularValorTotalImpostoVenda(item: any): number {

    if (item.nfeVendaVarejista === 'Não') {
        return 0;
    }

    try {
        const valorVendaComDesconto = this.calcularValorVendaTotalComDesconto(item);



        const parseTaxRate = (value: any): number => {
            if (value == null) return 0;
            const strValue = String(value).replace(',', '.');
            const parsed = parseFloat(strValue.replace(/[^\d.-]/g, ''));
            return isNaN(parsed) ? 0 : parsed / 100;
        };

        const irpj = parseTaxRate(item.dadosVarejistairpj);
        const csll = parseTaxRate(item.dadosVarejistacsll);
        const aliquotaPIS = parseTaxRate(item.dadosVarejistaaliquotapisSaida);
        const aliquotaCOFINS = parseTaxRate(item.dadosVarejistaaliquotacofinsSaida);
        const aliquotaICMS = parseTaxRate(item.dadosVarejistaaliquotaicms);

        // Calculate tax bases
        const baseCalculoPisCofins = valorVendaComDesconto * (1 - aliquotaICMS);

        // Calculate individual taxes
        const valorPIS = baseCalculoPisCofins * aliquotaPIS;
        const valorCOFINS = baseCalculoPisCofins * aliquotaCOFINS;
        const valorIRPJ_CSLL = valorVendaComDesconto * (irpj + csll);
        const valorICMS = valorVendaComDesconto * aliquotaICMS;

        // Calculate total taxes
        const totalImpostos = valorPIS + valorCOFINS + valorIRPJ_CSLL + valorICMS;

        return Math.max(totalImpostos, 0); // Ensure non-negative result
    } catch (error) {
        console.error('Error calculating total tax value:', error);
        return 0; // Return 0 in case of unexpected errors
    }
}


  calcularValorTotalDespesas(item: any): number {

    const calcularValorVendaTotalComDesconto = this.calcularValorVendaTotalComDesconto(item);
    const comissaoVarejista = item.comissaoVarejista / 100 || 0;
    const comissaoDistribuidor = item.comissaoDistribuidor / 100 || 0;
    const percentualFreteVenda = item.percentualFreteVenda / 100 || 0;
    const percentualTaxas = item.percentualTaxas / 100 || 0;

    return calcularValorVendaTotalComDesconto * (comissaoVarejista + comissaoDistribuidor + percentualFreteVenda + percentualTaxas);
  }

  calcularValorLucroBRL(item: any): number {
    const calcularValorVendaTotalComDesconto = this.calcularValorVendaTotalComDesconto(item) || 0;
    const calculoCustoTotal = this.calculoCustoTotal(item) || 0;
    const calcularValorTotalImpostoVenda = this.calcularValorTotalImpostoVenda(item) || 0;
    const calcularValorTotalDespesas = this.calcularValorTotalDespesas(item) || 0;
    const creditoIcms = this.calcularValorIcms(item) || 0;
    const difal = this.calculateDifal(item) || 0;


    return calcularValorVendaTotalComDesconto - (calculoCustoTotal + calcularValorTotalImpostoVenda + calcularValorTotalDespesas + difal ) + creditoIcms;

  }
  calcularValorLucroPercentual(item: any): number {
  const calcularValorVendaTotalComDesconto = this.calcularValorVendaTotalComDesconto(item);
  const calcularValorLucroBRL = this.calcularValorLucroBRL(item);

  return calcularValorLucroBRL / calcularValorVendaTotalComDesconto

  }

  calcularValorIcms(item: any): number {
    const {
        dadosDistribuidorcst: cstDistribuidor,
        dadosVarejistacst: cstVarejista,
        ufFornecedor,
        ufDistribuidor,
        ufVarejista,
        nfeTransferenciaDistribuidor
    } = item;

    const creditoIcmsDistribuidor = this.calcularIcmsCompra(item);
    const creditoIcmsVarejista = this.calcularIcmsTransferencia(item);

    // Venda para consumidor final (CST 60)
    if (cstVarejista === '60') {
        return 0;
    }

    // Transferência para varejista com CST 00
    if (nfeTransferenciaDistribuidor === 'Sim' && cstVarejista === '00') {
        return creditoIcmsVarejista;
    }

    // Compra interestadual
    if (ufFornecedor !== ufDistribuidor && cstDistribuidor === '00') {
        return creditoIcmsDistribuidor;
    }

    // Compra interna
    if (ufFornecedor === ufDistribuidor && cstDistribuidor === '00') {
        return creditoIcmsDistribuidor;
    }

    // Compra e venda dentro do mesmo estado sem transferência
    if (ufFornecedor === ufDistribuidor && ufDistribuidor === ufVarejista) {
        return creditoIcmsDistribuidor;
    }

    return 0;
}
  informacoesCreditoIcms(item: DadosTabela): string {
    const {
        dadosDistribuidorcst: cstDistribuidor,
        dadosVarejistacst: cstVarejista,
        nfeTransferenciaDistribuidor,
        aliquotaInterestadualDistribuidor,
        ufDistribuidor,
        ufVarejista,
        ufFornecedor
    } = item;

    const icmsCompra = this.totalIcmsCompraCst00;
    const icmsTransferencia = this.totalIcmsTransferenciaCst00;
    const icmsCompraTransferido = icmsCompra - icmsTransferencia;

    let mensagens: string[] = [];

    // Compra interestadual (ex: SP para RO)
    if (cstDistribuidor === '00' && ufFornecedor !== ufDistribuidor) {
        mensagens.push(`Crédito de ICMS da compra (${ufFornecedor}): R$ ${icmsCompra.toFixed(2)}`);
        if (nfeTransferenciaDistribuidor === 'Sim') {
            mensagens.push(`Transferência de ICMS para a filial (${ufVarejista}): R$ ${icmsTransferencia.toFixed(2)}`);
            if (cstVarejista === '00') {
                mensagens.push(`Crédito de ICMS na filial (${ufVarejista}): R$ ${icmsTransferencia.toFixed(2)}`);
            } else {
                mensagens.push(`Sem crédito de ICMS na filial (${ufVarejista}) devido à substituição tributária.`);
            }
        }
    }

    // Compra interna dentro do estado do distribuidor (ex: RO para RO)
    if (cstDistribuidor === '00' && ufFornecedor === ufDistribuidor) {
        mensagens.push(`Crédito de ICMS da compra: R$ ${icmsCompra.toFixed(2)}`);
        if (nfeTransferenciaDistribuidor === 'Sim') {
            mensagens.push(`Transferência de ICMS para  (${ufVarejista}): R$ ${icmsTransferencia.toFixed(2)}`);
            mensagens.push(`ICMS restante no distribuidor: R$ ${icmsCompraTransferido.toFixed(2)}`);
            if (cstVarejista === '00') {
                mensagens.push(`Crédito de ICMS (${ufVarejista}): R$ ${icmsTransferencia.toFixed(2)}`);
            } else {
                mensagens.push(`Sem crédito de ICMS (${ufVarejista}) devido à substituição tributária.`);
            }
        }
    }

    // Compra e venda dentro do mesmo estado sem transferência (ex: AC para AC)
    if (ufFornecedor === ufDistribuidor && ufDistribuidor === ufVarejista) {
        mensagens.push(`Crédito de ICMS da compra e venda dentro do estado (${ufDistribuidor}): R$ ${icmsCompra.toFixed(2)}`);
    }


    return mensagens.length > 0 ? mensagens.join("\n") : 'Não há crédito de ICMS aplicável.';
}






  calculateIRPJ(item: DadosTabela): number{
    const calcularValorVendaTotalComDesconto = this.calcularValorVendaTotalComDesconto(item);
    const irpj = item.dadosVarejistairpj / 100;
    return calcularValorVendaTotalComDesconto * irpj
  }
  calculateCSLL(item: DadosTabela): number{
    const calcularValorVendaTotalComDesconto = this.calcularValorVendaTotalComDesconto(item);
    const csll = item.dadosVarejistacsll / 100;
    return calcularValorVendaTotalComDesconto * csll
  }
  calculatePIS(item: DadosTabela): number {
    // Calculating the base value for PIS and COFINS by removing ICMS
    const calcularValorVendaTotalComDesconto = this.calcularValorVendaTotalComDesconto(item);
    const icms = this.calculateICMS(item);  // Calculate ICMS
    const baseCalculoPisCofins = calcularValorVendaTotalComDesconto - icms;

    const pis = item.dadosVarejistaaliquotapisSaida / 100;
    return baseCalculoPisCofins * pis;  // Calculate PIS based on the adjusted base
  }

  calculateCOFINS(item: DadosTabela): number {
    // Calculating the base value for PIS and COFINS by removing ICMS
    const calcularValorVendaTotalComDesconto = this.calcularValorVendaTotalComDesconto(item);
    const icms = this.calculateICMS(item);  // Calculate ICMS
    const baseCalculoPisCofins = calcularValorVendaTotalComDesconto - icms;  // Remove ICMS from the base

    const cofins = item.dadosVarejistaaliquotacofinsSaida / 100;
    return baseCalculoPisCofins * cofins;  // Calculate COFINS based on the adjusted base
  }

  calculateICMS(item: DadosTabela): number {
    // Ensure that 'dadosVarejistaaliquotaicms' is a valid string and clean it up
    let aliquotaicms = item.dadosVarejistaaliquotaicms ?
      String(item.dadosVarejistaaliquotaicms).replace(/[^\d,.-]/g, '').replace(',', '.') : '0';



    // Convert to a number
    let aliquotaNumber = parseFloat(aliquotaicms);

    // Handle NaN case
    if (isNaN(aliquotaNumber)) {
      aliquotaNumber = 0;
    }

    // Calculate the value of ICMS
    const valorVendaComDesconto = this.calcularValorVendaTotalComDesconto(item);
    const icms = aliquotaNumber / 100;

    // Return the ICMS value
    return valorVendaComDesconto * icms;
  }
  calculateDifal(item: DadosTabela): number {
    const aliquotaDifal = item.dadosVarejistaaliquotaDifal ?? 0;
    const valorVendaComDesconto = this.calcularValorVendaTotalComDesconto(item) ?? 0;

    // Garante que a alíquota é um número válido
    const icms = Number(aliquotaDifal) / 100;

    // Se o resultado for inválido (por exemplo, NaN), retorna 0
    const resultado = valorVendaComDesconto * icms;
    return isNaN(resultado) ? 0 : resultado;
  }


  calculateComissaoDistribuidor(item: DadosTabela): number{
    const calcularValorVendaTotalComDesconto = this.calcularValorVendaTotalComDesconto(item);
    const comissao = item.comissaoDistribuidor / 100;
    return calcularValorVendaTotalComDesconto * comissao
  }
  calculateComissaoVarejista(item: DadosTabela): number{
    const calcularValorVendaTotalComDesconto = this.calcularValorVendaTotalComDesconto(item);
    const comissao = item.comissaoVarejista / 100;
    return calcularValorVendaTotalComDesconto * comissao
  }
  calculateFreteVenda(item: DadosTabela): number{
    const calcularValorVendaTotalComDesconto = this.calcularValorVendaTotalComDesconto(item);
    const frete = item.percentualFreteVenda / 100;
    return calcularValorVendaTotalComDesconto * frete
  }
  calculateTaxa(item: DadosTabela): number{
    const calcularValorVendaTotalComDesconto = this.calcularValorVendaTotalComDesconto(item);
    const taxas = item.percentualTaxas / 100;
    return calcularValorVendaTotalComDesconto * taxas
  }
  calculateDesconto(item: DadosTabela): number{
    const calcularValorVendaTotalComDesconto = this.calcularValorVendaTotalComDesconto(item);
    const desconto = item.percentualDesconto / 100;
    return calcularValorVendaTotalComDesconto * desconto
  }
  calculateFreteCompra(item: DadosTabela): number{
    const calcularValorVendaTotalComDesconto = this.calcularValorVendaTotalComDesconto(item);
    const frete = item.percentualFreteCompra / 100;
    return calcularValorVendaTotalComDesconto * frete
  }
  calculateFreteTransferencia(item: DadosTabela): number{
    const calcularValorVendaTotalComDesconto = this.calcularValorVendaTotalComDesconto(item);
    const frete = item.percentualFreteTransferencia / 100;
    return calcularValorVendaTotalComDesconto * frete
  }


  //Totalizar Valores

  get totalValorCompraSemFrete() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.calculoValorCompraUnitarioXQuantidadeProduto(item), 0);
  }

  get totalFreteTransferencia() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.calculateFreteTransferencia(item), 0);
  }

  get totalFreteCompra() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.calcularValorFreteCompra(item), 0);
  }

  get totalComissoesDistribuidor() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.calculateComissaoDistribuidor(item), 0);
  }

  get totalDesconto() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.calculateDesconto(item), 0);
  }

  get totalComissoesVarejista() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.calculateComissaoVarejista(item), 0);
  }

  get totalFreteVenda() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.calculateFreteVenda(item), 0);
  }

  get totalTaxas() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.calculateTaxa(item), 0);
  }

  get totalCreditoICMS() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .filter(item => item.nfeVendaVarejista === 'Sim')
      .reduce((total, item) => total + this.calcularValorIcms(item), 0);
  }

  get totalQuantidade() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + item.quantidadeProduto, 0);
  }

  get totalIRPJ() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .filter(item => item.nfeVendaVarejista === 'Sim')
      .reduce((total, item) => total + this.calculateIRPJ(item), 0);
  }

  get totalICMS() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .filter(item => item.nfeVendaVarejista === 'Sim')
      .reduce((total, item) => total + this.calculateICMS(item), 0);
  }
  get totalDifal() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .filter(item => item.nfeVendaVarejista === 'Sim')
      .reduce((total, item) => total + this.calculateDifal(item), 0);
  }

  get totalCOFINS() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .filter(item => item.nfeVendaVarejista === 'Sim')
      .reduce((total, item) => total + this.calculateCOFINS(item), 0);
  }

  get totalCSLL() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .filter(item => item.nfeVendaVarejista === 'Sim')
      .reduce((total, item) => total + this.calculateCSLL(item), 0);
  }

  get totalPIS() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .filter(item => item.nfeVendaVarejista === 'Sim')
      .reduce((total, item) => total + this.calculatePIS(item), 0);
  }

  get totalCompra() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.calculoValorCompraUnitarioXQuantidadeProduto(item), 0);
  }
  get totalCompraComFrete() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.calcularValorCompraTotalComValorFrete(item), 0);
  }


  get totalIcmsSt() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.calcularDiferencaICMSSTeICMSInterestadual(item), 0);
  }

  get totalIcmsStTransferencia() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.calcularDiferencaICMSSTeICMSInterestadualVarejista(item), 0);
  }

  get totalIcmsStFinal() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => {
        const valorVarejista = this.calcularDiferencaICMSSTeICMSInterestadualVarejista(item);
        const valorNormal = this.calcularDiferencaICMSSTeICMSInterestadual(item);
        return total + (valorVarejista !== 0 ? valorVarejista : valorNormal);
      }, 0);
  }
  get totalIcmsCompra() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.calcularIcmsCompra(item), 0);
  }

  get totalIcmsCompraCst00() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.IcmsCompra(item), 0);
  }

  get totalIcmsTransferencia() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.calcularIcmsTransferencia(item), 0);
  }

  get totalIcmsTransferenciaCst00() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.IcmsTransferencia(item), 0);
  }

  get custoTotal() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.calculoCustoTotal(item), 0);
  }

  get vendaTotal() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.calcularValorVendaTotalComDesconto(item), 0);
  }

  get vendaTotalSemDesconto() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.calcularValorVendaTotalSemDesconto(item), 0);
  }

  get impostoTotal() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.calcularValorTotalImpostoVenda(item), 0);
  }

  get despesaTotal() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.calcularValorTotalDespesas(item), 0);
  }

  get lucroTotal() {
    return this.dadosTabela
      .filter(item => !item.naoVender)
      .reduce((total, item) => total + this.calcularValorLucroBRL(item), 0);
  }

  get percentualLucro() {
    return this.vendaTotal > 0 ? this.lucroTotal / this.vendaTotal : 0;
  }


// Buscar valores
buscarMVADistribuidor(item: DadosTabela): number {
  const aliquota = item.aliquotaInterestadualFornecedor;
  const mva = item.dadosDistribuidormvaOriginal;
  const mva4 = item.dadosDistribuidormvaAliquota4;
  const mva7 = item.dadosDistribuidormvaAliquota7;
  const mva12 = item.dadosDistribuidormvaAliquota12

  if (aliquota === 4) {
    return mva4;
  }
  if (aliquota === 7) {
    return mva7;
  }
  if (aliquota === 12) {
    return mva12;
  }
  if (aliquota === 0) {
    return mva;
  }

  return 0;
}
buscarMVAVarejista(item: DadosTabela): number {
  const aliquota = item.aliquotaInterestadualDistribuidor;
  const mva = item.dadosVarejistamvaOriginal;
  const mva4 = item.dadosVarejistamvaAliquota4;
  const mva7 = item.dadosVarejistamvaAliquota7;
  const mva12 = item.dadosVarejistamvaAliquota12

  if (aliquota === 4) {
    return mva4;
  }
  if (aliquota === 7) {
    return mva7;
  }
  if (aliquota === 12) {
    return mva12;
  }
  if (aliquota === 0) {
    return mva;
  }

  return 0;
}

async cargaTributariaNCM(item: DadosTabela) {
  const modal = await this.modalController.create({
    component: DetalhesNcmComponent,
    componentProps: {
      ncm: item.ncm,
      cest: item.cest,

      //Dados NCM Varejista
      dadosVarejistacst: item.dadosVarejistacst,
      dadosVarejistaaliquotacofinsSaida: item.dadosVarejistaaliquotacofinsSaida,
      dadosVarejistaaliquotaDifal: item.dadosVarejistaaliquotaDifal,
      dadosVarejistaaliquotapisSaida:item.dadosVarejistaaliquotapisSaida,
      dadosVarejistaaliquotaicms: item.dadosVarejistaaliquotaicms,
      dadosVarejistamvaOriginal: item.dadosVarejistamvaOriginal,
      dadosVarejistamvaAliquota12:item.dadosVarejistamvaAliquota12,
      dadosVarejistamvaAliquota7: item.dadosVarejistamvaAliquota7,
      dadosVarejistamvaAliquota4: item.dadosVarejistamvaAliquota4,
      dadosVarejistairpj: item.dadosVarejistairpj,
      dadosVarejistacsll:item.dadosVarejistacsll,

      //Dados NCM Distribuidor
      dadosDistribuidoraliquotacofinsSaida: item.dadosDistribuidoraliquotacofinsSaida,
      dadosDistribuidoraliquotapisSaida:  item.dadosDistribuidoraliquotapisSaida,
      dadosDistribuidorcst:  item.dadosDistribuidorcst,
      dadosDistribuidoraliquotaicms:  item.dadosDistribuidoraliquotaicms,
      dadosDistribuidormvaOriginal: item.dadosDistribuidormvaOriginal,
      dadosDistribuidormvaAliquota12:  item.dadosDistribuidormvaAliquota12,
      dadosDistribuidormvaAliquota7:  item.dadosDistribuidormvaAliquota7,
      dadosDistribuidormvaAliquota4: item.dadosDistribuidormvaAliquota4,
      dadosDistribuidorirpj: item.dadosDistribuidorirpj,
      dadosDistribuidorcsll:item.dadosDistribuidorcsll,
    },
  });

  await modal.present();
}


printContent() {
  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.width;

  // Nome do arquivo
  const informacaoDestinacao = this.dadosTabela.map((item) =>
    `${item.nomeCliente || ''} - ${item.numeroOs || ''}`.trim()
  ).filter(Boolean);  const informacaoDestinacaoUnica = [...new Set(informacaoDestinacao)];
  const fileName = `Relatorio_${informacaoDestinacaoUnica.join('_')}.pdf`.replace(/\s+/g, '_');
  const nomeDistribuidor = 'Suporte Maquinas - Matriz';

  // Cabeçalho personalizado
  const headerHeight = 20;
  const headerTitle = 'Relatório Financeiro';
  const empresaNome = nomeDistribuidor;
  const descricao = 'Simulação detalhada de produtos e custos';

  // Desenha o cabeçalho
  doc.setFillColor(154, 230, 234); // Cor de fundo do cabeçalho
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 128);
  doc.text(headerTitle, 10, 10);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(empresaNome, 10, 15);
  doc.text(descricao, 10, 19);

  // Data e hora no canto superior direito
  const date = new Date();
  const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  doc.setFontSize(8);
  doc.text(`Hórus Plataforma - Emitido em: ${formattedDate}`, pageWidth - 70, 10);

  // Títulos principais
  const title = informacaoDestinacaoUnica.map(item => {
    // Remove hífens extras e espaços desnecessários
    const cleaned = item.replace(/^-\s*|\s*-$/g, '').trim();
    return cleaned || 'Relatório Financeiro';
  }).join(' | ');
  const titleWidth = doc.getTextWidth(title);
  const titleX = (pageWidth - titleWidth) / 2;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(title, titleX, headerHeight + 10); // Título centralizado

  // Dados da tabela
  let yPosition = headerHeight + 20;

  // Cabeçalho da tabela
  const headers = [
    '#',
    'Descrição',
    'QT',
    'V. Un',
    'V.T',
    'ICMS-ST Compra',
    'ICMS-ST Transferência',
    'Custo Un',
    'Custo T.',
    'Margem',
    'V. Venda Un',
    'V.T. Venda',
    '% Desc',
    'V.Desc Un',
    'V.Desc T',
    'T.Impostos',
    'T.Despesas',
    'R$ Lucro',
    '% Lucro',
  ];

  // Prepara os dados da tabela
  const tableData = this.dadosTabela.map((item) => {
    return [
      item.sequencia,
      item.nomeProduto || 'N/A',
      item.quantidadeProduto || 'N/A',
      `${item.valorCompraProdutoUnitario || 'N/A'}`,
      `${this.calcularValorCompraTotalComValorFrete(item).toFixed(2) || 'N/A'}`,
      `${this.calcularDiferencaICMSSTeICMSInterestadual(item).toFixed(2) || 'N/A'}`,
      `${this.calcularDiferencaICMSSTeICMSInterestadualVarejista(item).toFixed(2) || 'N/A'}`,
      `${this.calcularCustoUn(item).toFixed(2) || 'N/A'}`,
      `${this.calculoCustoTotal(item).toFixed(2) || 'N/A'}`,
      `${item.percentualMargem || 'N/A'}`,
      `${this.calcularValorVendaUnSemDesconto(item).toFixed(2) || 'N/A'}`,
      `${this.calcularValorVendaTotalSemDesconto(item).toFixed(2) || 'N/A'}`,
      `${item.percentualDesconto || 'N/A'}`,
      `${this.calcularValorVendaUnComDesconto(item).toFixed(2) || 'N/A'}`,
      `${this.calcularValorVendaTotalComDesconto(item).toFixed(2) || 'N/A'}`,
      `${this.calcularValorTotalImpostoVenda(item).toFixed(2) || 'N/A'}`,
      `${this.calcularValorTotalDespesas(item).toFixed(2) || 'N/A'}`,
      `${this.calcularValorLucroBRL(item).toFixed(2) || 'N/A'}`,
      `${(this.calcularValorLucroPercentual(item) * 100).toFixed(2) || 'N/A'}%`
    ];
  });

  // Adiciona a tabela ao PDF com cabeçalho personalizado
  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: yPosition,
    theme: 'grid',
    headStyles: { fillColor: [154, 230, 234], textColor: [0, 0, 0], fontSize: 8, font: 'helvetica' },
    bodyStyles: { fontSize: 7, font: 'helvetica', fillColor: [255, 255, 255], textColor: [0, 0, 0] },
    margin: { top: 10, left: 10, right: 10, bottom: 15 },
    columnStyles: {
      0: { cellWidth: 5 }, // # (Índice)
      1: { cellWidth: 35 }, // Descrição
      2: { cellWidth: 10 }, // QT
      3: { cellWidth: 15 }, // V. Un
      4: { cellWidth: 15 }, // V.T
      5: { cellWidth: 15 }, // ICMS-ST Compra
      6: { cellWidth: 15 }, // ICMS-ST Transferência
      7: { cellWidth: 15 }, // Custo Un
      8: { cellWidth: 15 }, // Custo T.
      9: { cellWidth: 10 }, // Margem
      10: { cellWidth: 16 }, // V. Venda Un
      11: { cellWidth: 16 }, // V.T. Venda
      12: { cellWidth: 13 }, // % Desc
      13: { cellWidth: 16 }, // V.Desc Un
      14: { cellWidth: 16 }, // V.Desc T
      15: { cellWidth: 12 }, // T.Impostos
      16: { cellWidth: 15 }, // T.Despesas
      17: { cellWidth: 15 }, // R$ Lucro
      18: { cellWidth: 12 }, // % Lucro
    }
  });
  // Título totais
const title2 = 'VALORES TOTAIS';
const titleWidth2 = doc.getTextWidth(title2);
const titleX2 = (pageWidth - titleWidth2) / 2;

doc.text(title2, titleX2, doc.autoTableEndPosY() + 10); // Título centralizado após a tabela

// Exibe os totais
const totais = [
  ['Total Compra:', `R$ ${this.totalCompra.toFixed(2)}`],
  ['Total ICMS-ST:', `R$ ${this.totalIcmsSt.toFixed(2)}`],
  ['Total ICMS-ST Transferência:', `R$ ${this.totalIcmsStTransferencia.toFixed(2)}`],
  ['Custo Total:', `R$ ${this.custoTotal.toFixed(2)}`],
  ['Venda Total:', `R$ ${this.vendaTotal.toFixed(2)}`],
  ['Imposto Total:', `R$ ${this.impostoTotal.toFixed(2)}`],
  ['Despesa Total:', `R$ ${this.despesaTotal.toFixed(2)}`],
  ['Lucro Total:', `R$ ${this.lucroTotal.toFixed(2)}`],
  ['% Lucro:', `${(this.percentualLucro * 100).toFixed(2)}%`]
];

let yPositionTotais = doc.autoTableEndPosY() + 10;

doc.autoTable({
  head: [['Total', 'Valor']],
  body: totais.map(row => [row[0], row[1]]),
  startY: yPositionTotais,
    theme: 'grid',
    headStyles: { fillColor: [154, 230, 234], textColor: [0, 0, 0], fontSize: 8, font: 'helvetica' },
    bodyStyles: { fontSize: 7, font: 'helvetica', fillColor: [255, 255, 255], textColor: [0, 0, 0] },
    columnStyles: {
    0: { cellWidth: 40 },
    1: { cellWidth: 20 }
  },
  margin: { top: 10, left: 10, right: 10, bottom: 15 }
});


  // Renderiza o PDF
  const pdfContent = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfContent);
  const newWindow = window.open(pdfUrl, '_blank');

  if (newWindow) {
    newWindow.document.title = fileName;
  }
}


exportToExcel(): void {
  const informacaoDestinacao = this.dadosTabela.map((item) =>
    `${item.nomeCliente || ''} - ${item.numeroOs || ''}`.trim()
  ).filter(Boolean);
  const informacaoDestinacaoUnica = [...new Set(informacaoDestinacao)];

  const fileName = `Relatorio_${informacaoDestinacaoUnica.join('_')}.xlsx`.replace(/\s+/g, '_');

  // Prepare the table data for export
  const worksheetData: { [key: string]: any }[] = this.dadosTabela.map((item, index) => ({
    '#': index + 1,
    'Descrição': item.nomeProduto,
    'QT': item.quantidadeProduto,
    'V. Un': item.valorCompraProdutoUnitario,
    'V.T': this.calcularValorCompraTotalComValorFrete(item).toFixed(2),
    'ICMS-ST Compra': this.calcularDiferencaICMSSTeICMSInterestadual(item).toFixed(2),
    'ICMS-ST Transferência': this.calcularDiferencaICMSSTeICMSInterestadualVarejista(item).toFixed(2),
    'Custo Un': this.calcularCustoUn(item).toFixed(2),
    'Custo T.': this.calculoCustoTotal(item).toFixed(2),
    'Margem': item.percentualMargem,
    'V. Venda Un': this.calcularValorVendaUnSemDesconto(item).toFixed(2),
    'V.T. Venda': this.calcularValorVendaTotalSemDesconto(item).toFixed(2),
    '% Desc': item.percentualDesconto,
    'V.Desc Un': this.calcularValorVendaUnComDesconto(item).toFixed(2),
    'V.Desc T': this.calcularValorVendaTotalComDesconto(item).toFixed(2),
    'T.Impostos': this.calcularValorTotalImpostoVenda(item).toFixed(2),
    'T.Despesas': this.calcularValorTotalDespesas(item).toFixed(2),
    'R$ Lucro': this.calcularValorLucroBRL(item).toFixed(2),
    '% Lucro': (this.calcularValorLucroPercentual(item) * 100).toFixed(2),
    'Fornecedor': item.nomeFornecedor,
    'Cliente': item.nomeCliente,
    'Número OS': item.numeroOs,
    'NCM': item.ncm,
    'Cest': item.cest,

  }));

  // Create a worksheet and book
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(worksheetData);

  // Add borders to all cells
  if (ws['!ref']) {
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cell_address = { r: row, c: col };
        const cell_ref = XLSX.utils.encode_cell(cell_address);

        if (!ws[cell_ref]) {
          ws[cell_ref] = {}; // Create cell if it doesn't exist
        }

        // Define borders for each cell
        ws[cell_ref].s = {
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          }
        };
      }
    }
  }


  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados');

  // Export to Excel
  XLSX.writeFile(wb, fileName);
}





printDRE(): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  // Nome do arquivo
  const id = this.dadosTabela[0].cabecalhoId;
  const informacaoDestinacao = this.dadosTabela.map((item) =>
    `${item.nomeCliente || ''} - ${item.numeroOs || ''}`.trim()
  ).filter(Boolean);
  const informacaoDestinacaoUnica = [...new Set(informacaoDestinacao)];
  const fileName = `DRE - ${informacaoDestinacaoUnica.join('_')}.pdf`.replace(/\s+/g, '_');
  const nomeDistribuidor = 'Suporte Maquinas - Matriz';
  // Cabeçalho personalizado
  const headerHeight = 20;
  const headerTitle = 'Demonstração de Resultados do Exercício (DRE) - Produtos';
  const empresaNome = nomeDistribuidor;
  const descricao = 'Simulação detalhada de produtos e custos';


  // Desenha o cabeçalho
  doc.setFillColor(154, 230, 234); // Cor de fundo do cabeçalho
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 128);
  doc.text(headerTitle, 10, 10);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(empresaNome, 10, 15);
  doc.text(descricao, 10, 19);

  // Títulos principais
  const title = informacaoDestinacaoUnica.map(item => {
    // Remove hífens extras e espaços desnecessários
    const cleaned = item.replace(/^-\s*|\s*-$/g, '').trim();
    return cleaned || 'Relatório Financeiro';
  }).join(' | ');
  const titleWidth = doc.getTextWidth(title);
  const titleX = (pageWidth - titleWidth) / 2;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(title, titleX, headerHeight + 10); // Título centralizado

  // Dados da tabela
  let yPosition = headerHeight + 20;
  const item = this.dadosTabela[0];
  // Dados da DRE
  const dreData = [

    ['Receita Bruta de Peças', this.vendaTotalSemDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],

    ['(-) Descontos e Abatimentos', (this.vendaTotalSemDesconto - this.vendaTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],

    ['= Receita Líquida de Peças',(this.vendaTotalSemDesconto - (this.vendaTotalSemDesconto - this.vendaTotal)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],

    ['(-) Custo de Mercadoria', this.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
    ['    Valor de Compra', this.totalValorCompraSemFrete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
    ['    Frete de Compra', this.totalFreteCompra.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
    ['    ICMS a pagar da Transferência', this.totalIcmsTransferencia.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
    [
    '     ICMS ST',this.totalIcmsStFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    ],




    ['(-) Impostos', (this.impostoTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
    ['    IRPJ', this.totalIRPJ.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
    ['    CSLL', this.totalCSLL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
    ['    PIS', this.totalPIS.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
    ['    COFINS', this.totalCOFINS.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
    ['    ICMS', this.totalICMS.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],


    ['(-) Despesas Operacionais', this.despesaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
    ['    Comissão Distribuidor', this.totalComissoesDistribuidor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
    ['    Comissão Varejista', this.totalComissoesVarejista.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
    ['    Frete Venda', this.totalFreteVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
    ['    Taxas', this.totalTaxas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],


    ['(-) Outros Impostos', (this.totalDifal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
    ['    Diferencial de Alíquota', this.totalDifal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],


    ['(+) Outros', (this.totalCreditoICMS).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
    ['    Crédito de ICMS', this.totalCreditoICMS.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],





    ['= Lucro Bruto', this.lucroTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
    ['Lucro (%)', `${(this.percentualLucro * 100).toFixed(2)}%`],
  ];

  // Geração da tabela com autoTable
  (doc as any).autoTable({
    startY: yPosition,
    head: [['Descrição', 'Valor']],
    body: dreData.map(([descricao, valor]) => [
      {
        content: descricao,
        styles: { fontStyle: descricao.startsWith('=') || descricao.startsWith('(-)') || descricao.startsWith('(+)') ? 'bold' : 'normal' }
      },
      {
        content: valor,
        styles: { fontStyle: descricao.startsWith('=') || descricao.startsWith('(-)') || descricao.startsWith('(+)') ? 'bold' : 'normal' }
      }
    ]),
    theme: 'grid',
    headStyles: { fillColor: [154, 230, 234], textColor: [0, 0, 0], fontSize: 8, font: 'helvetica' },
    bodyStyles: { fontSize: 7, font: 'helvetica', fillColor: [255, 255, 255], textColor: [0, 0, 0] },
  });

  // Atualiza a posição de Y para o próximo conteúdo
  yPosition = headerHeight + 189; // Calcula a posição do conteúdo após a tabela

// Informações de crédito ICMS (apresentação após a tabela)
 // Informações de crédito ICMS (apresentação após a tabela)
 const descricaoCredito = this.dadosTabela.map((item) => this.informacoesCreditoIcms(item));
 const descricaoCreditoUnica = [...new Set(descricaoCredito)];

 // Define o estilo da fonte
 doc.setFontSize(8);
 doc.setFont('helvetica', 'normal');

 // Configurações para quebra de linha
 const maxWidthCredito = 180; // Largura máxima do texto antes de quebrar a linha
 const lineHeightCredito = 5; // Altura da linha

 // Exibe as informações no PDF com quebra de linha
 if (descricaoCreditoUnica.length > 0 && descricaoCreditoUnica[0]) {
   doc.text('Informações Adicionais:', 10, yPosition);
   yPosition += lineHeightCredito + 2;
   descricaoCreditoUnica.forEach((texto) => {
     const textoQuebrado = doc.splitTextToSize(texto, maxWidthCredito); // Quebra o texto em várias linhas
     doc.text(textoQuebrado, 10, yPosition); // Exibe o texto quebrado no PDF
     yPosition += lineHeightCredito * textoQuebrado.length + 2; // Atualiza a posição Y com base no número de linhas
   });
 }

 // Adicionar código de barras
 if (id) {
   const canvas = document.createElement('canvas');
   JsBarcode(canvas, id.toString(), {
     format: 'CODE128',
     displayValue: false,
     width: 1,
     height: 20,
   });
   const barcodeDataURL = canvas.toDataURL('image/png');
   const barcodeX = pageWidth - 60;
   const barcodeY = pageHeight - 25;
   const barcodeWidth = 50;
   const barcodeHeight = 10;
   doc.addImage(barcodeDataURL, 'PNG', barcodeX, barcodeY, barcodeWidth, barcodeHeight);

   // Adicionar número abaixo do código de barras
   doc.setFontSize(8);
   doc.text(`ID: ${id}`, barcodeX, barcodeY + barcodeHeight + 5, { align: 'center' });
 }


  // Adicionar rodapé com data e hora de impressão
  const now = new Date();
  const dataHoraImpressao = now.toLocaleString('pt-BR');
  // Altura da página já declarada anteriormente
  doc.setFontSize(8);
  doc.text(`Hórus Plataforma - Emitido em: ${dataHoraImpressao}`, 10, pageHeight - 10);

  // Geração e exibição do PDF
  const pdfContent = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfContent);
  const newWindow = window.open(pdfUrl, '_blank');
  if (!newWindow) {
    doc.save(fileName);
  } else {
    newWindow.document.title = fileName;
  }
}

async finalizarSimulacao() {
  // Verificação mais robusta do cabecalhoId
  if (!this.cabecalhoId || typeof this.cabecalhoId !== 'string') {

    return;
  }

  try {
    // 1. Preparar dados para atualização
    const dadosAtualizacao = {
      finalizado: 'Sim',
      valorTotalVenda: this.vendaTotal,
      totalLucroReais: this.lucroTotal,
      dataFinalizacao: new Date()
    };

    // 2. Referência do documento
    const docRef = this.firestore.collection('cabecalhoProdutos').doc(this.cabecalhoId);

    // 3. Obter dados atuais para o log (antes da atualização)
    const docSnapshot = await docRef.get();
    const dadosAntigos = (await docSnapshot.toPromise())?.data();

    // 4. Executar atualização
    await docRef.update(dadosAtualizacao);

    // 5. Registrar log da operação
    await this.registrarLogFinalizacao(dadosAntigos, dadosAtualizacao);

    // 6. Feedback ao usuário
    await this.mostrarToast('Simulação finalizada com sucesso!', 'success');



  } catch (error) {
    console.error('Erro na finalização:', error);
    await this.mostrarToast(
      `Falha ao finalizar: ${error instanceof Error ? error.message : 'Consulte o console'}`,
      'danger',

    );
  }
}

// Métodos auxiliares
private async registrarLogFinalizacao(dadosAntigos: any, dadosNovos: any) {
  try {
    await this.loggerService.registrarLog(
      'atualizacao',
      'cabecalhoProdutos',
      this.cabecalhoId,
      {
        dadosAntigos,
        dadosNovos,
        detalhes: 'Finalização de simulação de vendas'
      }
    );
  } catch (logError) {
    console.error('Falha ao registrar log:', logError);
  }
}



async iniciarEdicao(item: DadosTabela & { editando?: boolean }): Promise<void> {
  if (!item) return;

  item.editando = true;
  // Faz uma cópia profunda apenas dos campos editáveis
  this.copiaEditavel = <Partial<DadosTabela>>{
    nomeProduto: item.nomeProduto,
    quantidadeProduto: item.quantidadeProduto,
    valorCompraProdutoUnitario: item.valorCompraProdutoUnitario,
    percentualMargem: item.percentualMargem,
    percentualDesconto: item.percentualDesconto,
    aliquotaInterestadualFornecedor: item.aliquotaInterestadualFornecedor,
    percentualFreteCompra: item.percentualFreteCompra,
    percentualFreteVenda: item.percentualFreteVenda,
    percentualTaxas: item.percentualTaxas,
    dadosVarejistaaliquotaicms: item.dadosVarejistaaliquotaicms,
    produtoEstoque: item.produtoEstoque,
    nfeTransferenciaDistribuidor: item.nfeTransferenciaDistribuidor,
    nfeCompraFornecedor: item.nfeCompraFornecedor,
    nfeVendaVarejista: item.nfeVendaVarejista,
  };
}

// Método para validar os dados antes de salvar
private validarDados(item: DadosEditaveis): boolean {
  return (
    item.nomeProduto?.trim() !== '' &&
    item.quantidadeProduto > 0 &&
    item.valorCompraProdutoUnitario >= 0 &&
    item.percentualMargem >= 0 &&
    item.percentualDesconto >= 0 &&
    item.aliquotaInterestadualFornecedor >= 0 &&
    item.produtoEstoque?.trim() !== '' &&
    item.nfeTransferenciaDistribuidor?.trim() !== '' &&
    item.nfeCompraFornecedor?.trim() !== '' &&
    item.nfeVendaVarejista?.trim() !== ''

  );
}

async finalizarEdicao(item: DadosTabela & { editando?: boolean }, applyToAll: boolean = false): Promise<void> {
  if (!item?.editando || !this.copiaEditavel) return;

  if (!this.validarDados(item)) {
    await this.mostrarToast('Dados inválidos. Verifique os valores informados.', 'warning');
    return;
  }

  try {
    if (!applyToAll && this.shouldAskApplyToAll(item)) {
      const confirm = await this.showApplyToAllConfirmation();
      if (confirm === 'all') {
        await this.applyChangesToAllItems(item);
        item.editando = false;
        this.copiaEditavel = null;
        return;
      } else if (confirm === 'cancel') {
        this.reverterAlteracoes(item);
        item.editando = false;
        return;
      }
    }

    const dadosAtualizacao = this.getUpdateData(item);

    if (!applyToAll) {
      await this.firestore.collection('produtosSimulados')
        .doc(item.id)
        .update(dadosAtualizacao);

      // Log da atualização do item único
      await this.loggerService.registrarLog(
        'atualizacao',
        'produtosSimulados',
        item.id,
        {
          antes: this.copiaEditavel,
          depois: dadosAtualizacao
        }
      );
    }

    await this.mostrarToast('Dados atualizados com sucesso!', 'success');
  } catch (error) {
    console.error('Erro ao atualizar:', error);
    this.reverterAlteracoes(item);

    await this.loggerService.registrarLog(
      'erro',
      'produtosSimulados',
      item.id || 'desconhecido',
      null,
      null,
      `Erro ao atualizar item: ${(error instanceof Error ? error.message : 'Erro desconhecido')}`
    );

    await this.mostrarToast('Erro ao atualizar os dados. Tente novamente.', 'danger');
  } finally {
    if (!applyToAll) {
      item.editando = false;
      this.copiaEditavel = null;
    }
  }
}



private async showApplyToAllConfirmation(): Promise<'current' | 'all' | 'cancel'> {
  return new Promise(async (resolve) => {
    const alert = await this.alertController.create({
      header: 'Aplicar a todos?',
      message: 'Deseja aplicar esta alteração a todos os itens da lista?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: async () => {
            await alert.dismiss();
            resolve('cancel');
          }
        },
        {
          text: 'Apenas este',
          handler: async () => {
            await alert.dismiss();
            resolve('current');
          }
        },
        {
          text: 'Todos os itens',
          handler: async () => {
            await alert.dismiss();
            resolve('all');
          }
        }
      ]
    });

    await alert.present();
  });
}

private getUpdateData(item: DadosTabela): Partial<DadosEditaveis> {
  return {
    nomeProduto: item.nomeProduto,
    quantidadeProduto: item.quantidadeProduto,
    valorCompraProdutoUnitario: item.valorCompraProdutoUnitario,
    percentualMargem: item.percentualMargem,
    percentualDesconto: item.percentualDesconto,
    aliquotaInterestadualFornecedor: item.aliquotaInterestadualFornecedor,
    percentualFreteCompra: item.percentualFreteCompra,
    percentualFreteVenda: item.percentualFreteVenda,
    percentualTaxas: item.percentualTaxas,
    dadosVarejistaaliquotaicms: item.dadosVarejistaaliquotaicms,
    produtoEstoque: item.produtoEstoque,
    nfeTransferenciaDistribuidor: item.nfeTransferenciaDistribuidor,
    nfeCompraFornecedor: item.nfeCompraFornecedor,
    nfeVendaVarejista: item.nfeVendaVarejista,

  };
}
private async applyChangesToAllItems(sourceItem: DadosTabela): Promise<void> {
  const batch = this.firestore.firestore.batch();
  const logs: Promise<void>[] = [];

  this.dadosTabela.forEach(item => {
    const itemRef = this.firestore.collection('produtosSimulados').doc(item.id).ref;

    const updateData: Partial<DadosTabela> = {};
    const antes: Partial<DadosTabela> = {};

    if (sourceItem.nomeProduto !== this.copiaEditavel?.nomeProduto) {
      updateData.nomeProduto = sourceItem.nomeProduto;
      antes.nomeProduto = this.copiaEditavel?.nomeProduto;
    }
    if (sourceItem.quantidadeProduto !== this.copiaEditavel?.quantidadeProduto) {
      updateData.quantidadeProduto = sourceItem.quantidadeProduto;
      antes.quantidadeProduto = this.copiaEditavel?.quantidadeProduto;
    }
    if (sourceItem.valorCompraProdutoUnitario !== this.copiaEditavel?.valorCompraProdutoUnitario) {
      updateData.valorCompraProdutoUnitario = sourceItem.valorCompraProdutoUnitario;
      antes.valorCompraProdutoUnitario = this.copiaEditavel?.valorCompraProdutoUnitario;
    }
    if (sourceItem.percentualMargem !== this.copiaEditavel?.percentualMargem) {
      updateData.percentualMargem = sourceItem.percentualMargem;
      antes.percentualMargem = this.copiaEditavel?.percentualMargem;
    }
    if (sourceItem.percentualDesconto !== this.copiaEditavel?.percentualDesconto) {
      updateData.percentualDesconto = sourceItem.percentualDesconto;
      antes.percentualDesconto = this.copiaEditavel?.percentualDesconto;
    }
    if (sourceItem.aliquotaInterestadualFornecedor !== this.copiaEditavel?.aliquotaInterestadualFornecedor) {
      updateData.aliquotaInterestadualFornecedor = sourceItem.aliquotaInterestadualFornecedor;
      antes.aliquotaInterestadualFornecedor = this.copiaEditavel?.aliquotaInterestadualFornecedor;
    }
    if (sourceItem.percentualFreteCompra !== this.copiaEditavel?.percentualFreteCompra) {
      updateData.percentualFreteCompra = sourceItem.percentualFreteCompra;
      antes.percentualFreteCompra = this.copiaEditavel?.percentualFreteCompra;
    }
    if (sourceItem.percentualFreteVenda !== this.copiaEditavel?.percentualFreteVenda) {
      updateData.percentualFreteVenda = sourceItem.percentualFreteVenda;
      antes.percentualFreteVenda = this.copiaEditavel?.percentualFreteVenda;
    }
    if (sourceItem.percentualTaxas !== this.copiaEditavel?.percentualTaxas) {
      updateData.percentualTaxas = sourceItem.percentualTaxas;
      antes.percentualTaxas = this.copiaEditavel?.percentualTaxas;
    }
    if (sourceItem.dadosVarejistaaliquotaicms !== this.copiaEditavel?.dadosVarejistaaliquotaicms) {
      updateData.dadosVarejistaaliquotaicms = sourceItem.dadosVarejistaaliquotaicms;
      antes.dadosVarejistaaliquotaicms = this.copiaEditavel?.dadosVarejistaaliquotaicms;
    }
    if (sourceItem.produtoEstoque !== this.copiaEditavel?.produtoEstoque) {
      updateData.produtoEstoque = sourceItem.produtoEstoque;
      antes.produtoEstoque = this.copiaEditavel?.produtoEstoque;
    }
    if (sourceItem.nfeTransferenciaDistribuidor !== this.copiaEditavel?.nfeTransferenciaDistribuidor) {
      updateData.nfeTransferenciaDistribuidor = sourceItem.nfeTransferenciaDistribuidor;
      antes.nfeTransferenciaDistribuidor = this.copiaEditavel?.nfeTransferenciaDistribuidor;
    }
    if (sourceItem.nfeCompraFornecedor !== this.copiaEditavel?.nfeCompraFornecedor) {
      updateData.nfeCompraFornecedor = sourceItem.nfeCompraFornecedor;
      antes.nfeCompraFornecedor = this.copiaEditavel?.nfeCompraFornecedor;
    }
    if (sourceItem.nfeVendaVarejista !== this.copiaEditavel?.nfeVendaVarejista) {
      updateData.nfeVendaVarejista = sourceItem.nfeVendaVarejista;
      antes.nfeVendaVarejista = this.copiaEditavel?.nfeVendaVarejista;
    }

    if (Object.keys(updateData).length > 0) {
      batch.update(itemRef, updateData);
      Object.assign(item, updateData);

      logs.push(
        this.loggerService.registrarLog(
          'atualizacao',
          'produtosSimulados',
          item.id,
          {
            antes,
            depois: updateData
          }
        )
      );
    }

    item.editando = false;
  });

  try {
    await batch.commit();
    await Promise.all(logs);
    await this.mostrarToast(`Alterações aplicadas a ${this.dadosTabela.length} itens!`, 'success');
  } catch (error) {
    console.error('Erro ao atualizar em lote:', error);

    await this.loggerService.registrarLog(
      'erro',
      'produtosSimulados',
      'lote',
      null,
      null,
      `Erro ao aplicar alterações em lote: ${(error instanceof Error ? error.message : 'Erro desconhecido')}`
    );

    await this.mostrarToast('Erro ao aplicar alterações a todos os itens.', 'danger');
  } finally {
    this.copiaEditavel = null;
  }
}




// Método auxiliar para determinar se deve perguntar sobre aplicar a todos
private shouldAskApplyToAll(item: DadosTabela): boolean {
  // Só pergunta para certos campos que fazem sentido aplicar a todos
  const editableFields = [
    'percentualMargem',
    'percentualDesconto',
    'percentualFreteCompra',
    'percentualFreteVenda',
    'percentualTaxas',
    'dadosVarejistaaliquotaicms',
    'produtoEstoque',
    'nfeTransferenciaDistribuidor',
    'nfeCompraFornecedor',
    'nfeVendaVarejista'
  ];

  return editableFields.some(field =>
    this.copiaEditavel && (item[field as keyof DadosTabela] !== this.copiaEditavel[field as keyof DadosTabela])
  );
}

// Método auxiliar para reverter alterações
private reverterAlteracoes(item: DadosTabela): void {
  if (!this.copiaEditavel) return;

  item.nomeProduto = this.copiaEditavel.nomeProduto ?? '';
  item.quantidadeProduto = this.copiaEditavel.quantidadeProduto ?? 0;
  item.valorCompraProdutoUnitario = this.copiaEditavel.valorCompraProdutoUnitario ?? 0;
  item.percentualMargem = this.copiaEditavel.percentualMargem ?? 0;
  item.percentualDesconto = this.copiaEditavel.percentualDesconto ?? 0;
  item.aliquotaInterestadualFornecedor = this.copiaEditavel.aliquotaInterestadualFornecedor ?? 0;
  item.percentualFreteCompra = this.copiaEditavel.percentualFreteCompra ?? 0;
  item.percentualFreteVenda = this.copiaEditavel.percentualFreteVenda ?? 0;
  item.percentualTaxas = this.copiaEditavel.percentualTaxas ?? 0;
  item.dadosVarejistaaliquotaicms = this.copiaEditavel.dadosVarejistaaliquotaicms ?? '';
  item.produtoEstoque = this.copiaEditavel.produtoEstoque ?? '';
  item.nfeTransferenciaDistribuidor = this.copiaEditavel.nfeTransferenciaDistribuidor ?? '';
  item.nfeCompraFornecedor = this.copiaEditavel.nfeCompraFornecedor ?? '';
  item.nfeVendaVarejista = this.copiaEditavel.nfeVendaVarejista ?? '';
}

// Método auxiliar para mostrar feedback ao usuário
private async mostrarToast(mensagem: string, cor: string): Promise<void> {
  const toast = await this.toastController.create({
    message: mensagem,
    duration: 1000,
    color: cor,
    position: 'bottom',
  });
  await toast.present();
}

async salvarSequencia(): Promise<void> {
  const batch = this.firestore.firestore.batch();
  let alteracoes = 0;
  const logs: Promise<void>[] = [];

  this.dadosTabela.forEach((item) => {
    if (item.sequencia !== item.sequenciaOriginal) {
      const itemRef = this.firestore.collection('produtosSimulados').doc(item.id).ref;
      batch.update(itemRef, { sequencia: item.sequencia });
      alteracoes++;

      // Log da alteração de sequência
      logs.push(
        this.loggerService.registrarLog(
          'atualizacao',
          'produtosSimulados',
          item.id,
          { sequencia: item.sequencia }
        )
      );

      // Atualiza o valor original após alteração
      item.sequenciaOriginal = item.sequencia;
    }
  });

  try {
    if (alteracoes > 0) {
      await batch.commit();
      await Promise.all(logs); // Aguarda todos os logs serem gravados

      this.dadosTabela.sort((a, b) => (a.sequencia ?? 0) - (b.sequencia ?? 0));
      await this.mostrarToast('Sequência atualizada com sucesso!', 'success');
    } else {
      await this.mostrarToast('Nenhuma alteração de sequência detectada.', 'warning');
    }
  } catch (error) {
    console.error('Erro ao salvar sequência:', error);

    // Log do erro
    await this.loggerService.registrarLog(
      'erro',
      'produtosSimulados',
      'sequencia',
      null,
      null,
      `Erro ao salvar sequência: ${(error instanceof Error ? error.message : 'Erro desconhecido')}`
    );

    await this.mostrarToast('Erro ao salvar a nova sequência.', 'danger');
  }
}


importarPlanilha(event: any): void {
  const file = event.target.files[0];
  if (!file) {
    console.error('Nenhum arquivo selecionado.');
    return;
  }

  const reader = new FileReader();

  reader.onload = async (e: any) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    const primeiraAba = workbook.SheetNames[0];
    const planilha = workbook.Sheets[primeiraAba];

    const dadosJson: any[] = XLSX.utils.sheet_to_json(planilha, { defval: '' });

    // Atualiza localmente dadosTabela conforme a planilha
    this.dadosTabela = this.dadosTabela.map((item, index) => {
      const linha = dadosJson[index];
      if (!linha) return item;

      return {
        ...item,
        nomeProduto: linha['Itens do Pedido/Descrição'] || item.nomeProduto,
        quantidadeProduto: linha['Itens do Pedido/Quantidade'] || item.quantidadeProduto,
        valorCompraProdutoUnitario: linha['Itens do Pedido/Preço Unitário'] || item.valorCompraProdutoUnitario
      };
    });

    console.log('dadosTabela atualizada:', this.dadosTabela);

    try {
      const batch = this.firestore.firestore.batch();
      const logs: Promise<void>[] = [];

      this.dadosTabela.forEach(item => {
        if (!item.id) return;

        const docRef = this.firestore.collection('produtosSimulados').doc(item.id).ref;

        const updateData: Partial<DadosTabela> = {
          nomeProduto: item.nomeProduto,
          quantidadeProduto: item.quantidadeProduto,
          valorCompraProdutoUnitario: item.valorCompraProdutoUnitario
        };

        batch.update(docRef, updateData);

        // Adiciona log de atualização
        logs.push(
          this.loggerService.registrarLog(
            'atualizacao',
            'produtosSimulados',
            item.id,
            updateData
          )
        );
      });

      await batch.commit();
      await Promise.all(logs);

      await this.mostrarToast(`Planilha importada e ${this.dadosTabela.length} itens atualizados no Firestore.`, 'success');
    } catch (error) {
      console.error('Erro ao atualizar Firestore após importar planilha:', error);

      // Log de erro
      await this.loggerService.registrarLog(
        'erro',
        'produtosSimulados',
        'importarPlanilha',
        null,
        null,
        `Erro ao importar planilha: ${(error instanceof Error ? error.message : 'Erro desconhecido')}`
      );

      await this.mostrarToast('Erro ao atualizar dados no banco após importar planilha.', 'danger');
    }
  };

  reader.readAsArrayBuffer(file);
}

// Variável para controlar a direção da ordenação
ordenacaoSequencia: 'asc' | 'desc' = 'asc';

// Método para ordenar por sequência
ordenarPorSequencia() {
  this.dadosTabela.sort((a, b) => {
    const seqA = Number(a.sequencia);
    const seqB = Number(b.sequencia);

    if (this.ordenacaoSequencia === 'asc') {
      return seqA - seqB;
    } else {
      return seqB - seqA;
    }
  });

  this.ordenacaoSequencia = this.ordenacaoSequencia === 'asc' ? 'desc' : 'asc';
}

}
