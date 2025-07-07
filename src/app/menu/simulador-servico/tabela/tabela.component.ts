import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormGroup, FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AliquotasService } from 'src/app/services/aliquotas.service';  // Importa o serviço
import { FirebaseNCMService } from 'src/app/services/firebase-ncm.service';

import {jsPDF} from 'jspdf'
import "jspdf-autotable";
import * as XLSX from 'xlsx';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: any;
    autoTableEndPosY: any; // Add this line to extend jsPDF with autoTable
  }
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  selector: 'app-tabela',
  templateUrl: './tabela.component.html',
  styleUrls: ['./tabela.component.scss'],
})
export class TabelaComponent  implements OnInit {
  @Input() dadosTabela: any[] = [];
  @Input() simuladorServicoForm!: FormGroup;
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

  printContent(){
    window.print();
  }
  exportToExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dadosTabela);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tabela de Dados');
    XLSX.writeFile(wb, 'dados_tabela.xlsx');
  }

  exportToPDF(){
    console.log('Exportar para PDF');
  }
  nomeVarejista(item: any): string {
    return item.nomeVarejista;
  }

  printDRE(): void {
    const doc = new jsPDF();

    // Definição do nome do arquivo
    const fileName = 'Demonstrativo_Resultado_Exercicio.pdf';


    doc.setFontSize(10);
    doc.text('Horus - Plataforma', 10, 10); // Cabeçalho à esquerda


    // Título
    doc.setFontSize(18);
    doc.text('Demonstração do Resultado do Exercício (DRE)', 10, 20);

    // Subtítulo
    doc.setFontSize(12);
    doc.text('Resumo Financeiro', 10, 30);

    // Dados da DRE
    const dreData = [
      ['Receita Bruta de Serviços', this.totalServicoSemDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['(-) Descontos e Abatimentos', (this.totalServicoSemDesconto - this.totalServicoComDesconto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['= Receita Líquida de Serviços', this.totalServicoComDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['(-) Impostos Retidos', this.totalImpostosRetidos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['(-) Impostos Não Retidos', this.totalImpostosNaoRetidos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['(-) Despesas Operacionais', this.totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['= Lucro Bruto', this.totalLucroReais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['Lucro (%)', `${(this.totalLucroPercentual*100).toFixed(2)}%`],
    ];

    // Geração da tabela com autoTable
    (doc as any).autoTable({
      startY: 40,
      head: [['Descrição', 'Valor']],
      body: dreData,
    });

    // Adicionar rodapé com data e hora de impressão
    const now = new Date();
    const dataHoraImpressao = now.toLocaleString('pt-BR');
    const pageHeight = doc.internal.pageSize.height; // Altura da página
    doc.setFontSize(10);
    doc.text(`Impresso em: ${dataHoraImpressao}`, 10, pageHeight - 10);

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



  salvarDadosSimulador(){
    console.log('Salvar Dados Simulador');
  }
  removeItem(index: number): void {
    this.dadosTabela.splice(index, 1);
  }

  calculateVTServico(item: any): number {
    const valorCusto = parseFloat(item.valorServicoMecanico) || 0;  // Ensures the value is a valid number, defaults to 0 if invalid
    const margem = parseFloat(item.percentualMargem) || 0;  // Ensures the value is a valid number, defaults to 0 if invalid

    return (valorCusto * (margem / 100)) + valorCusto;  // Perform the calculation
  }
  calculateVTServicoComDesconto(item: any): number {
    const calculateVTServico = this.calculateVTServico(item);
    const desconto = parseFloat(item.percentualDesconto) || 0;

    return calculateVTServico - (calculateVTServico * (desconto / 100));
  }
  caculateTotalImpostoRetido(item: any): number {
    const csllRetido = item.csllRetido || 0;
    const aliquotapisSaida = item.aliquotapisSaida || 0;
    const aliquotacofinsSaida = item.aliquotacofinsSaida || 0;

    // Calcula o valor do serviço com desconto
    const calculateVTServicoComDesconto = this.calculateVTServicoComDesconto(item) || 0;


    // Soma as alíquotas de PIS e COFINS
    const totalAliquota = aliquotapisSaida + aliquotacofinsSaida + csllRetido;


    // Calcula o total de imposto retido
    return calculateVTServicoComDesconto * (totalAliquota / 100);

}

  caculateTotalImpostoNaoRetido(item: any): number {
    const aliquotaISS = item.aliquotaISS || 0;
    const irpj = item.irpj || 0;
    const csll = item.csll || 0;

    // Calcula o valor do serviço com desconto
    const calculateVTServicoComDesconto = this.calculateVTServicoComDesconto(item) || 0;

    // Soma as alíquotas de ISS, IRPJ e CSLL
    const totalAliquota = aliquotaISS + irpj + csll;

    // Calcula o total de impostos
    return calculateVTServicoComDesconto * (totalAliquota / 100);
  }

  caculateTotalDespesas(item: any): number {
    const comissaoDistribuidor = parseFloat(item.comissaoDistribuidor) || 0;
    const comissaoVarejista = parseFloat(item.comissaoVarejista) || 0;
    const percentualTaxas = parseFloat(item.percentualTaxas) || 0;

    const totalAliquota = comissaoDistribuidor + comissaoVarejista + percentualTaxas;

    // Calcula o valor do serviço com desconto
    const calculateVTServicoComDesconto = this.calculateVTServicoComDesconto(item) || 0;

    // Soma as comissões
    return calculateVTServicoComDesconto * (totalAliquota/100);
  }

  caculateTotalLucroReais(item: any): number {
    const valorServicoMecanico = parseFloat(item.valorServicoMecanico) || 0;
    const totalImpostoRetido = this.caculateTotalImpostoRetido(item) || 0;
    const totalImpostoNaoRetido = this.caculateTotalImpostoNaoRetido(item) || 0;
    const totalDespesas = this.caculateTotalDespesas(item) || 0;

    const calculateVTServicoComDesconto = this.calculateVTServicoComDesconto(item) || 0;

    return calculateVTServicoComDesconto - totalImpostoRetido - totalImpostoNaoRetido - totalDespesas - valorServicoMecanico;
  }

  caculateTotalLucroPercentual(item: any): number {
    const totalLucroReais = this.caculateTotalLucroReais(item) || 0;
    const calculateVTServicoComDesconto = this.calculateVTServicoComDesconto(item) || 0;


    return (totalLucroReais / calculateVTServicoComDesconto) * 100;
  }

  get totalServicoMecanico() {
    return this.dadosTabela.reduce((total, item) => total + parseFloat(item.valorServicoMecanico), 0);
  }
  get totalServicoSemDesconto() {
    return this.dadosTabela.reduce((total, item) => total + this.calculateVTServico(item), 0);
  }
  get totalServicoComDesconto() {
    return this.dadosTabela.reduce((total, item) => total + this.calculateVTServicoComDesconto(item), 0);
  }
  get totalImpostosRetidos() {
    return this.dadosTabela.reduce((total, item) => total + this.caculateTotalImpostoRetido(item), 0);
  }
  get totalImpostosNaoRetidos() {
    return this.dadosTabela.reduce((total, item) => total + this.caculateTotalImpostoNaoRetido(item), 0);
  }
  get totalDespesas() {
    return this.dadosTabela.reduce((total, item) => total + this.caculateTotalDespesas(item), 0);
  }
  get totalLucroReais() {
    return this.dadosTabela.reduce((total, item) => total + this.caculateTotalLucroReais(item), 0);
  }
  get totalLucroPercentual() {
    return this.totalLucroReais / this.totalServicoComDesconto ;
  }

}
