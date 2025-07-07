import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalInformacoesNcmComponent } from './modal-informacoes-ncm/modal-informacoes-ncm.component';
import { AliquotasService } from 'src/app/services/aliquotas.service';  // Importa o serviço
import { FirebaseNCMService } from 'src/app/services/firebase-ncm.service';
import { ModalInformacoesCalculoIcmsstComponent } from './modal-informacoes-calculo-icmsst/modal-informacoes-calculo-icmsst.component';
import { ModalInformacoesCalculoImpostoComponent } from './modal-informacoes-calculo-imposto/modal-informacoes-calculo-imposto.component';
import { ModalInformacoesCalculoDespesasComponent } from './modal-informacoes-calculo-despesas/modal-informacoes-calculo-despesas.component';
import {jsPDF} from 'jspdf'
import "jspdf-autotable";
import * as XLSX from 'xlsx';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: any;
    autoTableEndPosY: any; // Add this line to extend jsPDF with autoTable
  }
}


interface NCMData {
  mvaAliquota4?: string;
  mvaAliquota12?: string;
  mvaAliquota7?: string;
  mvaOriginal?: string;
}

@Component({
  standalone: true,
  imports: [
    IonicModule,
    CommonModule
  ],
  selector: 'app-tabela',
  templateUrl: './tabela.component.html',
  styleUrls: ['./tabela.component.scss'],
})
export class TabelaComponent implements OnInit {
  @Input() dadosTabela: any[] = [];
  @Input() simuladorForm!: FormGroup;
  mostrarCodigo: boolean = false;
  selectedItemIndex: number = -1;
  informacaoDestinacao: [] = [];


  constructor(
    private modalController: ModalController,
    private firestore: AngularFirestore,
    private FirebaseNCMService: FirebaseNCMService,  // Injeta o serviço
    public aliquotasService: AliquotasService,
    private location: Location,
    private alertController: AlertController



  ) { }

  ngOnInit() {

   }



  toggleMostrarCodigo() {
    this.mostrarCodigo = !this.mostrarCodigo;
  }


  calculateVTCompra(item: any): number {
    const valorCompra = item.quantidadeProduto * item.valorCompraProdutoUnitario;
    return valorCompra;
  }

  calculateVFrete(item: any): number {
    const valorCompra = item.quantidadeProduto * item.valorCompraProdutoUnitario;
    const frete = (item.percentualFreteCompra / 100) || 0;
    return valorCompra * frete;
  }

  calculateFreteCompra(item: any): number {
    const valorFrete = ((item.percentualFreteCompra / 100) * (item.quantidadeProduto * item.valorCompraProdutoUnitario)) + (item.quantidadeProduto * item.valorCompraProdutoUnitario);
    return valorFrete;
  }

  calculateIcmsCompra(item: any): number {
    const cst = item.cst
    if (cst === '00'){
      const valorCompra = this.calculateFreteCompra(item);
      const aliquotaInterestadualFornecedor = item.aliquotaInterestadualFornecedor;


      return valorCompra * (aliquotaInterestadualFornecedor/100);
    }else{
      return 0
    }


  }
  calculateIcms(item: any): number{
    const valorCompra = this.calculateFreteCompra(item);
      const aliquotaInterestadualFornecedor = item.aliquotaInterestadualFornecedor;


      return valorCompra * (aliquotaInterestadualFornecedor/100);
  }
  async cargaTributariaNCMCompra(ncmCompra: string, cestCompra: string, ufDistribuidor: string) {
    const modal = await this.modalController.create({
      component: ModalInformacoesNcmComponent,
      componentProps: {
        ncm: ncmCompra,
        cest: cestCompra,
        uf: ufDistribuidor,
      },
    });

    await modal.present();
  }



  calcularBaseIcmsSt(item: any): number {
    const cst = item.cst
    if (cst === 'FF'){
      const freteCompra = this.calculateFreteCompra(item);
      const percentualMVA = item.percentualMVA;


      const baseIcmsSt = (freteCompra * (percentualMVA/100)) + freteCompra;

      return baseIcmsSt;
    }else{
      return 0
    }

  }

  debitoICMSST(item: any): number {
    const aliquotaInterna = item.aliquotaInternaDistribuidor;
    const baseICMSST = this.calcularBaseIcmsSt(item);
    const debito = (baseICMSST * (aliquotaInterna/100))
    return debito;

  }

  async carregarCalculoDespesas(item: any) {
    const calculoVlrDespesas = this.calculoVlrDespesas(item);
    const calculoDescontoVlrVendaTotal = this.calculoDescontoVlrVendaTotal(item);
    const modal = await this.modalController.create({
      component: ModalInformacoesCalculoDespesasComponent,
      componentProps: {
        item: item,
        calculoVlrDespesas: calculoVlrDespesas,
        calculoDescontoVlrVendaTotal:calculoDescontoVlrVendaTotal



      }
    });

    return await modal.present();
  }



 async carregarCalculoImposto(item: any) {
    const calculoDescontoVlrVendaTotal = this.calculoDescontoVlrVendaTotal(item);
    const calculoDescontoVlrVendaUn = this.calculoDescontoVlrVendaUn(item);
    const valorTotalImpostoVenda = this.valorTotalImpostoVenda(item);
    const calculateIcms = this.calculateIcms(item);

    const modal = await this.modalController.create({
      component: ModalInformacoesCalculoImpostoComponent,
      componentProps: {
        item: item,
        calculoDescontoVlrVendaTotal: calculoDescontoVlrVendaTotal,
        calculoDescontoVlrVendaUn:calculoDescontoVlrVendaUn,
        valorTotalImpostoVenda:valorTotalImpostoVenda,
        calculateIcms:calculateIcms,


      }
    });

    return await modal.present();
  }


 async carregarCalculoICMSST(item: any) {
    const valorCompra = this.calculateFreteCompra(item);
    const freteCompra = this.calculateVFrete(item);
    const baseIcmsSt = this.calcularBaseIcmsSt(item);
    const debitoIcmsSt = this.debitoICMSST(item);
    const calculateIcmsCompra = this.calculateIcmsCompra(item);
    const calculoDifICMS = this.calculoDifICMS(item);



    const modal = await this.modalController.create({
      component: ModalInformacoesCalculoIcmsstComponent,
      componentProps: {
        item: item,
        freteCompra: freteCompra,
        baseIcmsSt: baseIcmsSt,
        debitoIcmsSt: debitoIcmsSt,
        valorCompra:valorCompra,
        calculateIcmsCompra:calculateIcmsCompra,
        calculoDifICMS:calculoDifICMS,

      }
    });

    return await modal.present();
  }

  calculoDifICMS(item: any): number {
    const tipoFornecedor = item.atividadeFornecedor;
    const nfeCompra = item.nfeCompraFornecedor;
    const percentualMVA = item.percentualMVA


    if (tipoFornecedor === 'Indústria') {
      return 0;
    }

    if (nfeCompra === 'Nao') {
      return 0;
    }
    if (percentualMVA === '0') {
      return 0;
    }


    const debitoICMSST = this.debitoICMSST(item);
    const calculateIcmsCompra = this.calculateIcmsCompra(item);

    return debitoICMSST - calculateIcmsCompra;
  }


  calculoCustoUn(item: any): number{
  const freteCompra = this.calculateFreteCompra(item);
  const calculoDifICMS = this.calculoDifICMS(item);
  const quantidadeProduto = item.quantidadeProduto;
return (freteCompra + calculoDifICMS )/quantidadeProduto
  }

  calculoCustoTotal(item: any): number{
    const freteCompra = this.calculateFreteCompra(item);
    const calculoDifICMS = this.calculoDifICMS(item);
  return freteCompra + calculoDifICMS
  }

  calculoVlrVendaUn(item: any): number{
    const valorCustoUn = this.calculoCustoUn(item);
    const margem = item.percentualMargem;
    return (valorCustoUn * (margem/100)) + valorCustoUn
  }
  calculoVlrVendaTotal(item: any): number{
    const valorCustoUn = this.calculoCustoUn(item);
    const quantidadeProduto = item.quantidadeProduto;
    const margem = item.percentualMargem;
    return ((valorCustoUn * (margem/100)) + valorCustoUn)*quantidadeProduto
  }

  calculoDescontoVlrVendaUn(item: any): number{
    const calculoVlrVendaUn = this.calculoVlrVendaUn(item);
    const desconto = item.percentualDesconto;
    return (calculoVlrVendaUn - (calculoVlrVendaUn * (desconto/100)))
  }
  calculoDescontoVlrVendaTotal(item: any): number{
    const calculoVlrVendaTotal = this.calculoVlrVendaTotal(item);
    const desconto = item.percentualDesconto;
    return (calculoVlrVendaTotal- (calculoVlrVendaTotal * (desconto/100)))
    return item.valor;

  }
  valorTotalImpostoVenda(item: any): number {

    if (item.nfeVendaVarejista === 'Nao') {
        return 0;
    }

    const calculoDescontoVlrVendaTotal = this.calculoDescontoVlrVendaTotal(item);
    const irpj = item.irpj / 100;
    const csll = item.csll / 100;
    const aliquotapisSaida = item.aliquotapisSaida / 100;
    const aliquotacofinsSaida = item.aliquotacofinsSaida / 100;

    let aliquotaicms = item.aliquotaicms ? item.aliquotaicms.replace(/[^\d,.-]/g, '').replace(',', '.') : '0';

    if (['FF', 'II', 'NN'].includes(item.aliquotaicms)) {
        aliquotaicms = '0';
    }

    aliquotaicms = parseFloat(aliquotaicms) / 100;

    return calculoDescontoVlrVendaTotal * (irpj + csll + aliquotacofinsSaida + aliquotapisSaida + aliquotaicms);
}


  calculoVlrDespesas(item: any): number {
    // Get the discounted total sale value
    const calculoDescontoVlrVendaTotal = this.calculoDescontoVlrVendaTotal(item);

    // Convert percentages to decimals (divide by 100)
    const comissaoVarejista = item.comissaoVarejista / 100;
    const comissaoDistribuidor = item.comissaoDistribuidor / 100;
    const percentualFreteVenda = item.percentualFreteVenda / 100;
    const percentualTaxas = item.percentualTaxas / 100;

    // Calculate the total expenses by applying all the percentage values
    return calculoDescontoVlrVendaTotal * (comissaoVarejista + comissaoDistribuidor + percentualFreteVenda + percentualTaxas);
  }
  calculoVlrLucro(item: any): number {
  const calculoDescontoVlrVendaTotal = this.calculoDescontoVlrVendaTotal(item);
  const calculoCustoTotal = this.calculoCustoTotal(item);
  const valorTotalImpostoVenda = this.valorTotalImpostoVenda(item);
  const calculoVlrDespesas = this.calculoVlrDespesas(item);
  return calculoDescontoVlrVendaTotal - (calculoCustoTotal + valorTotalImpostoVenda + calculoVlrDespesas)

  }

  calculoPercentualLucro(item: any): number {
  const calculoDescontoVlrVendaTotal = this.calculoDescontoVlrVendaTotal(item);
  const calculoVlrLucro = this.calculoVlrLucro(item);

  return calculoVlrLucro / calculoDescontoVlrVendaTotal

  }

  removeItem(index: number): void {
    this.dadosTabela.splice(index, 1);
  }

  printContent() {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.width;


    const informacaoDestinacao = this.dadosTabela.map((item) => item.paraQuemSimulacao);
    const informacaoDestinacaoUnica = [...new Set(informacaoDestinacao)];

    const fileName = `Relatorio_${informacaoDestinacaoUnica.join('_')}.pdf`.replace(/\s+/g, '_');


    // Títulos
    const title = informacaoDestinacaoUnica.join(', ');
    const titleWidth = doc.getTextWidth(title);
    const titleX = (pageWidth - titleWidth) / 2;

    doc.setFontSize(7);
    doc.setFont('montserrat', 'normal');
    doc.text(title, titleX, 20); // Título centralizado

    // Data e hora de impressão no rodapé à esquerda
    const date = new Date();
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    doc.text(`Data e Hora de Impressão: ${formattedDate}`, 10, doc.internal.pageSize.height - 10); // Rodapé à esquerda

    // Dados da tabela
    let yPosition = 40;

    // Cabeçalho da tabela
    const headers = [
      '#',
      'Descrição',
      'QT',
      'V. Un',
      'V.T',
      'ICMS-ST',
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
    const tableData = this.dadosTabela.map((item, index) => {
      return [
        index + 1,
        item.nomeProduto || 'N/A',
        item.quantidadeProduto || 'N/A',
        `R$ ${item.valorCompraProdutoUnitario || 'N/A'}`,
        `R$ ${this.calculateFreteCompra(item).toFixed(2) || 'N/A'}`,
        `R$ ${this.calculoDifICMS(item).toFixed(2) || 'N/A'}`,
        `R$ ${this.calculoCustoUn(item).toFixed(2) || 'N/A'}`,
        `R$ ${this.calculoCustoTotal(item).toFixed(2) || 'N/A'}`,
        `${item.percentualMargem || 'N/A'}%`,
        `R$ ${this.calculoVlrVendaUn(item).toFixed(2) || 'N/A'}`,
        `R$ ${this.calculoVlrVendaTotal(item).toFixed(2) || 'N/A'}`,
        `${item.percentualDesconto || 'N/A'}%`,
        `R$ ${this.calculoDescontoVlrVendaUn(item).toFixed(2) || 'N/A'}`,
        `R$ ${this.calculoDescontoVlrVendaTotal(item).toFixed(2) || 'N/A'}`,
        `R$ ${this.valorTotalImpostoVenda(item).toFixed(2) || 'N/A'}`,
        `R$ ${this.calculoVlrDespesas(item).toFixed(2) || 'N/A'}`,
        `R$ ${this.calculoVlrLucro(item).toFixed(2) || 'N/A'}`,
        `${(this.calculoPercentualLucro(item) * 100).toFixed(2) || 'N/A'}%`
      ];
    });

    // Adiciona a tabela ao PDF
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontSize: 7, font: 'montserrat' },
      bodyStyles: { fontSize: 7, font: 'montserrat', fillColor: [255, 255, 255], textColor: [0, 0, 0] },
      margin: { top: 10, left: 10, right: 10, bottom: 15 },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 40 },
        2: { cellWidth: 10 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 15 },
        6: { cellWidth: 15 },
        7: { cellWidth: 15 },
        8: { cellWidth: 10 },
        9: { cellWidth: 15 },
        10: { cellWidth: 15 },
        11: { cellWidth: 15 },
        12: { cellWidth: 15 },
        13: { cellWidth: 15 },
        14: { cellWidth: 15 },
      }
    });

    // Título totais
    const title2 = 'Valores Totais';
    const titleWidth2 = doc.getTextWidth(title2);
    const titleX2 = (pageWidth - titleWidth2) / 2;

    doc.text(title2, titleX2, doc.autoTableEndPosY() + 10); // Título centralizado após a tabela

    // Exibe os totais
    const totais = [
      ['Total Compra:', `R$ ${this.totalCompra.toFixed(2)}`],
      ['Total ICMS-ST:', `R$ ${this.totalIcmsSt.toFixed(2)}`],
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
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontSize: 7, font: 'montserrat' },
      bodyStyles: { fontSize: 7, font: 'montserrat', fillColor: [255, 255, 255], textColor: [0, 0, 0] },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 20 }
      },
      margin: { top: 10, left: 10, right: 10, bottom: 15 }
    });

    const pdfContent = doc.output('blob');

    // Cria uma URL para o Blob do PDF
    const pdfUrl = URL.createObjectURL(pdfContent);

    // Abre o PDF em uma nova aba
    const newWindow = window.open(pdfUrl, '_blank');

    // Sugerir o nome do arquivo ao salvar
    if (newWindow) {
      newWindow.document.title = fileName; // Define o título da aba como o nome do arquivo
    }
  }




  get totalCompra() {
    return this.dadosTabela.reduce((total, item) => total + this.calculateVTCompra(item), 0);
  }

  get totalIcmsSt() {
    return this.dadosTabela.reduce((total, item) => total + this.debitoICMSST(item), 0);
  }

  get custoTotal() {
    return this.dadosTabela.reduce((total, item) => total + this.calculoCustoTotal(item), 0);
  }

  get vendaTotal() {
    return this.dadosTabela.reduce((total, item) => total + this.calculoDescontoVlrVendaTotal(item), 0);
  }

  get impostoTotal() {
    return this.dadosTabela.reduce((total, item) => total + this.valorTotalImpostoVenda(item), 0);
  }

  get despesaTotal() {
    return this.dadosTabela.reduce((total, item) => total + this.calculoVlrDespesas(item), 0);
  }

  get lucroTotal() {
    return this.dadosTabela.reduce((total, item) => total + this.calculoVlrLucro(item), 0);
  }

  get percentualLucro() {
    return this.lucroTotal / this.vendaTotal;
  }
  exportToExcel(): void {
    const informacaoDestinacao = this.dadosTabela.map((item) => item.paraQuemSimulacao);
    const informacaoDestinacaoUnica = [...new Set(informacaoDestinacao)];

    const fileName = `Relatorio_${informacaoDestinacaoUnica.join('_')}.xlsx`.replace(/\s+/g, '_');
    // Prepare the table data for export
    const worksheetData = this.dadosTabela.map(item => ({
      DescricaoProduto: item.nomeProduto,
      NCMCompra: item.ncmCompra,
      CESTCompra: item.cestCompra,
      Quantidade: item.quantidadeProduto,
      ValorUnitario: item.valorCompraProdutoUnitario,
      VTCompra: this.calculateVTCompra(item),
      VFrete: this.calculateVFrete(item),
      FreteCompra: this.calculateFreteCompra(item),
      VICMSST: this.debitoICMSST(item),
      CustoUn: this.calculoCustoUn(item),
      CustoTotal: this.calculoCustoTotal(item),
      PercentualMargem: item.percentualMargem,
      VVendaUn: this.calculoVlrVendaUn(item),
      VVendaTotal: this.calculoVlrVendaTotal(item),
      PercentualDesconto: item.percentualDesconto,
      VUnDesconto: this.calculoDescontoVlrVendaUn(item),
      VTDesconto: this.calculoDescontoVlrVendaTotal(item),
      VTImpostos: this.valorTotalImpostoVenda(item),
      VTDespesas: this.calculoVlrDespesas(item),
      R$Lucro: this.calculoVlrLucro(item),
      VLucro: this.calculoPercentualLucro(item)
    }));

    // Create a worksheet and book
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(worksheetData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dados');

    // Export to Excel
    XLSX.writeFile(wb, (fileName));
  }
  printDRE() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Definição do nome do arquivo
    const fileName = `Demonstrativo_Resultado_Exercicio.pdf`;

    // Título do DRE
    const title = 'Demonstrativo de Resultado do Exercício (DRE)';
    const titleWidth = doc.getTextWidth(title);
    const titleX = (pageWidth - titleWidth) / 2;

    doc.setFontSize(12);
    doc.setFont('montserrat', 'bold');
    doc.text(title, titleX, 20); // Título centralizado

    // Adiciona a marca d'água "Em Construção"
    doc.setFontSize(50);
    doc.setFont('montserrat', 'normal');
    doc.setTextColor(200, 200, 200); // Cor cinza claro
    doc.text('EM CONSTRUÇÃO', pageWidth / 2, pageHeight / 2, { align: 'center', angle: -45 });

    // Data e hora de impressão no rodapé à esquerda
    const date = new Date();
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    doc.setFontSize(8);
    doc.setFont('montserrat', 'normal');
    doc.setTextColor(0, 0, 0); // Cor preta para o rodapé
    doc.text(`Data e Hora de Impressão: ${formattedDate}`, 10, doc.internal.pageSize.height - 10); // Rodapé à esquerda

    // Dados do DRE estruturados
    const dreHeaders = ['Descrição', 'Valor (R$)'];
    const dreData = [
        ['Receita Bruta de Vendas', `R$ ${this.vendaTotal.toFixed(2)}`],
        ['(-) Deduções de Vendas', `R$ ${this.totalIcmsSt.toFixed(2)}`],
        ['Receita Líquida de Vendas', `R$ ${(this.vendaTotal - this.totalIcmsSt).toFixed(2)}`],
        ['(-) Custos dos Produtos Vendidos (CPV)', `R$ ${this.custoTotal.toFixed(2)}`],
        ['Lucro Bruto', `R$ ${(this.vendaTotal - this.totalIcmsSt - this.custoTotal).toFixed(2)}`],
        ['(-) Despesas Operacionais', `R$ ${this.despesaTotal.toFixed(2)}`],
        ['Lucro Operacional', `R$ ${(this.vendaTotal - this.totalIcmsSt - this.custoTotal - this.despesaTotal).toFixed(2)}`],
        ['(-) Impostos', `R$ ${this.impostoTotal.toFixed(2)}`],
        ['Lucro Líquido do Exercício', `R$ ${this.lucroTotal.toFixed(2)}`],
        ['% Lucro', `${(this.percentualLucro * 100).toFixed(2)}%`]
    ];

    // Adiciona os dados do DRE ao PDF
    doc.autoTable({
        head: [dreHeaders],
        body: dreData,
        startY: 40,
        theme: 'striped',
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontSize: 9, font: 'montserrat' },
        bodyStyles: { fontSize: 8, font: 'montserrat', textColor: [0, 0, 0] },
        columnStyles: {
            0: { cellWidth: 120 },
            1: { cellWidth: 70, halign: 'right' },
        },
        margin: { top: 10, left: 10, right: 10, bottom: 15 },
    });

    const pdfContent = doc.output('blob');

    // Cria uma URL para o Blob do PDF
    const pdfUrl = URL.createObjectURL(pdfContent);

    // Abre o PDF em uma nova aba ou sugere download
    const newWindow = window.open(pdfUrl, '_blank');
    if (!newWindow) {
        // Caso pop-ups estejam bloqueados, sugere o download direto
        doc.save(fileName);
    } else {
        newWindow.document.title = fileName; // Define o título da aba como o nome do arquivo
    }
}

async salvarDadosSimulador() {
  console.log('Tentando enviar dados do formulário...');
  if (this.dadosTabela) {
    await this.simuladorForm.markAllAsTouched();
    if (this.simuladorForm.valid) {
      console.log('Formulário válido, enviando dados...');
      const formData = this.simuladorForm.value;
      try {
        await this.firestore.collection('dadosSimulados').add(formData);
        console.log('Dados salvos com sucesso!');
        const alert = await this.alertController.create({
          header: 'Sucesso',
          message: 'Dados cadastrados com sucesso!',
          buttons: ['OK'],
        });
        await alert.present();
        this.location.back();
      } catch (error) {
        console.error('Erro ao salvar os dados:', error);
        const alert = await this.alertController.create({
          header: 'Erro',
          message: 'Ocorreu um erro ao salvar os dados. Por favor, tente novamente.',
          buttons: ['OK'],
        });
        await alert.present();
      }
    } else {
      console.log('Formulário inválido, não é possível enviar dados.');
      const alert = await this.alertController.create({
        header: 'Erro',
        message: 'Por favor, preencha todos os campos obrigatórios.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  } else {
    console.error('Formulario não inicializado.');
  }
}

}
