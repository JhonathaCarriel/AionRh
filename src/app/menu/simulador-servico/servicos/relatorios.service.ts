import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {

  constructor() { }

  printContent(dadosTabela: any[], totalServicoMecanico: number, totalServicoSemDesconto: number, totalServicoComDesconto: number, totalImpostosRetidos: number, totalImpostosNaoRetidos: number, totalDespesas: number, totalLucroReais: number, totalLucroPercentual: number) {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.width;

    // Nome do arquivo
    const informacaoDestinacao = dadosTabela.map((item) =>  `${item.paraQuemSimulacao || ''} - ${item.numeroOs || ''}`.trim()
  ).filter(Boolean);
    const informacaoDestinacaoUnica = [...new Set(informacaoDestinacao)];
    const fileName = `Relatorio_${informacaoDestinacaoUnica.join('_')}.pdf`.replace(/\s+/g, '_');
    const nomeVarejista = dadosTabela.length > 0 ? dadosTabela[0].nomeVarejista : 'Distribuidor Não Informado';

    // Cabeçalho personalizado
    const headerHeight = 20;
    const headerTitle = 'Relatório Financeiro';
    const empresaNome = nomeVarejista;
    const descricao = 'Simulação detalhada de serviços e custos';

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

    // Função para formatar valores em BRL
    const formatBRL = (value: number): string => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    // Função para formatar valores percentuais
    const formatPercent = (value: number): string => {
      return value ? `${(value * 100).toFixed(2)}%` : 'N/A';
    };

    // Dados da tabela
    let yPosition = 40;

    // Cabeçalho da tabela
    const headers = [
      'Código',
      'Descrição do Serviço',
      'Valor Serviço Mecânico',
      '% Margem',
      'V. Serviço S/Desconto',
      '% Desconto',
      'V. Serviço C/Desconto',
      'V. T. Imposto Retido',
      'V. T. Imposto',
      'V. T. Despesas',
      'R$ Lucro',
      '% Lucro'
    ];

    // Prepara os dados da tabela
    const tableData = dadosTabela.map((item, index) => {
      return [
        index + 1,
        item.nomeServico || 'N/A',
        formatBRL(item.valorServicoMecanico || 0),
        (item.percentualMargem || 0), // Formatação percentual
        formatBRL(this.calculateVTServico(item) || 0),
        (item.percentualDesconto || 0), // Formatação percentual
        formatBRL(this.calculateVTServicoComDesconto(item) || 0),
        formatBRL(this.caculateTotalImpostoRetido(item) || 0),
        formatBRL(this.caculateTotalImpostoNaoRetido(item) || 0),
        formatBRL(this.caculateTotalDespesas(item) || 0),
        formatBRL(this.caculateTotalLucroReais(item) || 0),
        formatPercent(this.caculateTotalLucroPercentual(item) / 100 || 0) // Formatação percentual
      ];
    });

    // Adiciona a tabela ao PDF
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [154, 230, 234], textColor: [0, 0, 0], fontSize: 8, font: 'helvetica' },
      bodyStyles: { fontSize: 7, font: 'helvetica', fillColor: [255, 255, 255], textColor: [0, 0, 0] },
      margin: { top: 10, left: 10, right: 10, bottom: 15 },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 50 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 },
        8: { cellWidth: 20 },
        9: { cellWidth: 20 },
        10: { cellWidth: 20 },
        11: { cellWidth: 20 }
      }
    });

    // Título totais
    const title2 = 'Valores Totais';
    const titleWidth2 = doc.getTextWidth(title2);
    const titleX2 = (pageWidth - titleWidth2) / 2;

    doc.text(title2, titleX2, doc.autoTableEndPosY() + 10); // Título centralizado após a tabela

    // Exibe os totais
    const totais = [
      ['Total Serviço Mecânico:', formatBRL(totalServicoMecanico)],
      ['Total Serviço Sem Desconto:', formatBRL(totalServicoSemDesconto)],
      ['Total Serviço Com Desconto:', formatBRL(totalServicoComDesconto)],
      ['Total Impostos Retidos:', formatBRL(totalImpostosRetidos)],
      ['Total Impostos Não Retidos:', formatBRL(totalImpostosNaoRetidos)],
      ['Total Despesas:', formatBRL(totalDespesas)],
      ['Total Lucro:', formatBRL(totalLucroReais)],
      ['Percentual Lucro:', formatPercent(totalLucroPercentual)] // Formatação percentual
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
        0: { cellWidth: 70 },
        1: { cellWidth: 30 }
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

  exportToExcel(dadosTabela: any[], totalServicoMecanico: number, totalServicoSemDesconto: number, totalServicoComDesconto: number, totalImpostosRetidos: number, totalImpostosNaoRetidos: number, totalDespesas: number, totalLucroReais: number, totalLucroPercentual: number): void {
    const informacaoDestinacao = dadosTabela.map((item) => item.paraQuemSimulacao);
    const informacaoDestinacaoUnica = [...new Set(informacaoDestinacao)];

    const fileName = `Relatorio_${informacaoDestinacaoUnica.join('_')}.xlsx`.replace(/\s+/g, '_');

    // Defina o tipo de worksheetData como Record<string, any> para permitir acesso dinâmico
    const worksheetData: Record<string, any>[] = dadosTabela.map((item, index) => ({
      "Código": index + 1 || 'N/A',
      "Descricao Servico": item.nomeServico || 'N/A',
      "Valor Serviço Mecânico": this.formatBRL(item.valorServicoMecanico || 0),
      "% Margem": item.percentualMargem ? `${item.percentualMargem}%` : 'N/A',
      "Valor Serviço Sem Desconto": this.formatBRL(this.calculateVTServico(item) || 0),
      "% Desconto": item.percentualDesconto ? `${item.percentualDesconto}%` : 'N/A',
      "Valor Serviço Com Desconto": this.formatBRL(this.calculateVTServicoComDesconto(item) || 0),
      "Valor Total Imposto Retido": this.formatBRL(this.caculateTotalImpostoRetido(item) || 0),
      "Valor Total Imposto": this.formatBRL(this.caculateTotalImpostoNaoRetido(item) || 0),
      "Valor Total Despesas": this.formatBRL(this.caculateTotalDespesas(item) || 0),
      "R$ Lucro": this.formatBRL(this.caculateTotalLucroReais(item) || 0),
      "% Lucro": `${(this.caculateTotalLucroPercentual(item)).toFixed(2)}%`
    }));

    // Add totals to the last row
    const totalRow = {
      "Código": "Total",
      "Descricao Servico": '',
      "Valor Serviço Mecânico": this.formatBRL(totalServicoMecanico),
      "% Margem": '',
      "Valor Serviço Sem Desconto": this.formatBRL(totalServicoSemDesconto),
      "% Desconto": '',
      "Valor Serviço Com Desconto": this.formatBRL(totalServicoComDesconto),
      "Valor Total Imposto Retido": this.formatBRL(totalImpostosRetidos),
      "Valor Total Imposto": this.formatBRL(totalImpostosNaoRetidos),
      "Valor Total Despesas": this.formatBRL(totalDespesas),
      "R$ Lucro": this.formatBRL(totalLucroReais),
      "% Lucro": `${(totalLucroPercentual * 100).toFixed(2)}%`
    };

    worksheetData.push(totalRow);

    // Create a worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(worksheetData);

    // Apply styles to the header row (bold)
    const columns = Object.keys(worksheetData[0]);
    columns.forEach((col, index) => {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: index })];
      if (cell) {
        // Set header cells to bold
        cell.s = { font: { bold: true } };

        // Add borders for all header cells
        cell.s.border = {
          top: { style: 'thin' },
          right: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' }
        };
      }
    });

    // Apply borders to the rest of the table data
    worksheetData.forEach((row, rowIndex) => {
      columns.forEach((col, colIndex) => {
        const cell = ws[XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex })]; // Start at row 1
        if (cell) {
          // Add borders to each cell
          cell.s = {
            border: {
              top: { style: 'thin' },
              right: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' }
            }
          };
        }
      });
    });

    // Adjust column widths automatically
    const colWidths = columns.map(col => {
      let maxLength = col.length; // Start with the length of the column name
      worksheetData.forEach(row => {
        const cellValue = row[col] || '';  // TypeScript vai entender que row[col] é válido
        maxLength = Math.max(maxLength, cellValue.toString().length);
      });
      return { wpx: maxLength * 7 }; // Adjust the width of each column
    });

    // Set column widths
    ws['!cols'] = colWidths;

    // Create a workbook and append the worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dados');

    // Export to Excel
    XLSX.writeFile(wb, fileName);
  }

  printDRE(dadosTabela: any[], totalServicoMecanico: number,  totalServicoSemDesconto: number, totalServicoComDesconto: number, totalImpostosRetidos: number, totalImpostosNaoRetidos: number, totalDespesas: number, totalLucroReais: number, totalLucroPercentual: number, totalCSLLRetido: number, totalPis: number, totalCofins: number, totalCSLL: number, totalIRPJ: number, totalIss: number, totalComissaoD: number, totalComissaoV: number, totalTaxas: number): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    // Nome do arquivo
    const informacaoDestinacao = dadosTabela.map((item) =>  `${item.paraQuemSimulacao || ''} - ${item.numeroOs || ''}`.trim()
  ).filter(Boolean);
    const informacaoDestinacaoUnica = [...new Set(informacaoDestinacao)];
    const fileName = `DRE - Serviços - ${informacaoDestinacaoUnica.join('_')}.pdf`.replace(/\s+/g, '_');
    const nomeVarejista = dadosTabela.length > 0 ? dadosTabela[0].nomeVarejista : 'Distribuidor Não Informado';

    // Cabeçalho personalizado
    const headerHeight = 30;
    const headerTitle = 'Demonstração de Resultados do Exercício (DRE) - Serviços';
    const empresaNome = nomeVarejista;
    const descricao = 'Simulação detalhada de serviços e custos';

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

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(title, titleX, headerHeight + 10); // Título centralizado

    // Dados da tabela
    let yPosition = headerHeight + 20;

    // Dados da DRE
    const dreData = [
      ['Receita Bruta de Serviços', totalServicoSemDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['(-) Descontos e Abatimentos', (totalServicoSemDesconto - totalServicoComDesconto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['= Receita Líquida de Serviços', totalServicoComDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['(-) Custo de Serviço Vendido (CSV)', totalServicoMecanico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['(-) Impostos Retidos', totalImpostosRetidos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['     CSLL R', totalCSLLRetido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['     PIS', totalPis.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['     COFINS', totalCofins.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['(-) Impostos Não Retidos', totalImpostosNaoRetidos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['     CSLL', totalCSLL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['     IRPJ', totalIRPJ.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['     ISS', totalIss.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],

      ['(-) Despesas Operacionais', totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['     Comissão Distribuidora', totalComissaoD.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['     Comissão Varejista', totalComissaoV.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['     Taxas', totalTaxas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],

      ['= Lucro Bruto', totalLucroReais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['Lucro (%)', `${(totalLucroPercentual * 100).toFixed(2)}%`],
    ];

    // Geração da tabela com autoTable
    (doc as any).autoTable({
      startY: 50,
      head: [['Descrição', 'Valor']],
      body: dreData.map(([descricao, valor]) => [
        {
          content: descricao,
          styles: { fontStyle: descricao.startsWith('=') || descricao.startsWith('(-)') ? 'bold' : 'normal' }
        },
        {
          content: valor,
          styles: { fontStyle: descricao.startsWith('=') || descricao.startsWith('(-)') ? 'bold' : 'normal' }
        }
      ]),
      theme: 'grid',
      headStyles: { fillColor: [154, 230, 234], textColor: [0, 0, 0], fontSize: 10, font: 'helvetica' },
      bodyStyles: { fontSize: 10, font: 'helvetica', fillColor: [255, 255, 255], textColor: [0, 0, 0] },
    });

    // Adicionar rodapé com data e hora de impressão
    const now = new Date();
    const dataHoraImpressao = now.toLocaleString('pt-BR');
    const pageHeight = doc.internal.pageSize.height; // Altura da página
    doc.setFontSize(10);
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

  // Função para formatar valores em BRL
  formatBRL(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }



  calculateVTServico(item: any): number {
    const valorCusto = parseFloat(item.valorServicoMecanico + item.valorMateriais) || 0;
    const margem = parseFloat(item.percentualMargem) || 0;
    return (valorCusto * (margem / 100)) + valorCusto;
  }
  calculateVTServicoComDesconto(item: any): number {
    const calculateVTServico = this.calculateVTServico(item);
    const desconto = parseFloat(item.percentualDesconto) || 0;
    return calculateVTServico - (calculateVTServico * (desconto / 100));
  }

  caculateTotalImpostoRetido(item: any): number {
    const csllRetido = this.calculateCSLLRetido(item) || 0;
    const pis = this.calculatealiquotapisSaida(item) || 0;
    const cofins = this.calculatealiquotaCofinsSaida(item) || 0;

    return csllRetido + pis + cofins;
}

calculateIRPJ(item: any): number {
  const baseCalculo = this.calculateVTServicoComDesconto(item) || 0;
  const irpj = item.irpj || 0;
  return baseCalculo * (irpj/100);
}

calculateCSLL(item: any): number {
  const baseCalculo = this.calculateVTServicoComDesconto(item) || 0;
  const csll = item.csll || 0;
  return baseCalculo * (csll/100);
}

calculateCSLLRetido(item: any): number {

  const baseCalculo = this.calculateVTServicoComDesconto(item) || 0;
  const csll = item.csllRetido || 0;
  return baseCalculo * (csll/100);
}
calculatealiquotapisSaida(item: any): number {
const baseCalculo = this.calculateVTServicoComDesconto(item) || 0;
const PIS = item.aliquotapisSaida || 0;
return baseCalculo * (PIS/100);
}

calculatealiquotaCofinsSaida(item: any): number {
const baseCalculo = this.calculateVTServicoComDesconto(item) || 0;
const cofins = item.aliquotacofinsSaida || 0;
return baseCalculo * (cofins/100);
}



calculateIss(item: any): number {
const valorServico = item.valorServicoMecanico || 0;
const margem = (item.percentualMargem || 0) / 100;
const valorCusto = (valorServico * margem) + valorServico || 0;
const desconto = (item.percentualDesconto || 0) / 100;

const valorServicoComDesconto = valorCusto - (valorCusto * desconto) || 0;

const aliquotaISS = (item.aliquotaISS || 0) / 100;


const baseCalculo = valorServicoComDesconto || 0;


const valorISS = baseCalculo * aliquotaISS;


return valorISS;

}


calculateComissaoV(item: any): number{
  const calculateVTServicoComDesconto = this.calculateVTServicoComDesconto(item) || 0;
  const comissao = item.comissaoVarejista
  return calculateVTServicoComDesconto * (comissao/100)
}
calculateComissaoD(item: any): number{
  const calculateVTServicoComDesconto = this.calculateVTServicoComDesconto(item) || 0;
  const comissao = item.comissaoDistribuidor
  return calculateVTServicoComDesconto * (comissao/100)
}
calculateTaxas(item: any): number{
  const calculateVTServicoComDesconto = this.calculateVTServicoComDesconto(item) || 0;
  const taxas = item.percentualTaxas
  return calculateVTServicoComDesconto * (taxas/100)
}



caculateTotalImpostoNaoRetido(item: any): number {
  const iss = this.calculateIss(item) || 0; // Já calcula apenas sobre o serviço
  const irpj = this.calculateIRPJ(item) || 0;
  const csll = this.calculateCSLL(item) || 0;
  return iss + irpj + csll;
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

    const valorServicoMecanico = parseFloat(item.valorServicoMecanico + item.valorMateriais) || 0;
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
}
