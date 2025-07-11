import { Component, OnInit } from '@angular/core';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { DatePipe } from '@angular/common';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: any;
    autoTableEndPosY: any;
  }
}

@Component({
  selector: 'app-criar',
  templateUrl: './criar.page.html',
  styleUrls: ['./criar.page.scss'],
  providers: [DatePipe] // Certifique-se de que o DatePipe está sendo fornecido
})
export class CriarPage implements OnInit {
  formData = {
    nomeCatequizando: 'João da Silva',
    dataNascimento: '2005-06-15',
    naturalidade: 'Nova União, Rondônia',
    nomePai: 'José da Silva',
    nomeMae: 'Maria da Silva',
    turmaCatequese: 'Primeira Comunhão', // Você pode ajustar para a turma desejada
    comunidade: 'Nossa Senhora da Nova Aliança',
    paroquia: 'Nossa Senhora Aparecida',
    diocese: 'Ouro Preto do Oeste, Rondônia',
    dataDeclaracao: '2025-03-04',    // A data de declaração será a data atual
    nomeCoordenador: 'Paulo Henrique',
  };

  constructor(private datePipe: DatePipe) {}

  ngOnInit() {}

  gerarDeclaracao() {
    const doc = new jsPDF();

    // Definir margens
    const marginLeft = 20; // 3cm da esquerda
    const marginTop = 20;  // 2cm do topo
    const marginRight = 180; // 2cm da direita (210mm - 20mm = 180mm)
    const lineHeight = 10;

    // Ajustar a fonte para Arial, tamanho 12
    doc.setFont('Arial', 'normal');
    doc.setFontSize(12);

    // Adicionar nome da comunidade abaixo do brasão (centralizado com margem de 5px do cabeçalho)
    doc.setFontSize(14);
    doc.text('COMUNIDADE NOSSA SENHORA DA NOVA ALIANÇA', 105, marginTop + 5, { align: 'center' });

    let y = marginTop + 30; // Começar logo abaixo do nome da comunidade

    // Adicionar título "DECLARAÇÃO" em negrito, centralizado
    doc.setFont('Arial', 'bold');
    doc.setFontSize(16);
    doc.text('DECLARAÇÃO', 105, y, { align: 'center' });

    y += 20; // Aumenta o espaçamento após o título

    // Formatar as datas
    const dataNascimentoFormatada = this.datePipe.transform(this.formData.dataNascimento, 'dd/MM/yyyy');
    const dataDeclaracaoFormatada = this.datePipe.transform(this.formData.dataDeclaracao, 'dd/MM/yyyy');

    // Adicionar o texto de declaração
    const text1 = `Declaro para os devidos fins que, até a presente data, o catequizando ${this.formData.nomeCatequizando}, nascido em ${dataNascimentoFormatada}, natural de ${this.formData.naturalidade}, Brasil, filho de ${this.formData.nomePai} e de ${this.formData.nomeMae}, encontra-se matriculado na turma de catequese de ${this.formData.turmaCatequese} na Comunidade ${this.formData.comunidade}, na Paróquia ${this.formData.paroquia}, diocese de ${this.formData.diocese}. Para autenticar a veracidade das afirmações, assino abaixo.`;

    doc.setFont('Arial', 'normal');
    doc.setFontSize(12);
    doc.text(text1, marginLeft, y, { maxWidth: marginRight - marginLeft, align: 'justify' });
    y += lineHeight * 3; // Pula algumas linhas após o texto de declaração

    // Adicionar data de declaração (justificado à esquerda e com o formato desejado)
    const textDate = `Nova União, Rondônia, ${this.datePipe.transform(this.formData.dataDeclaracao, 'dd')} de ${this.datePipe.transform(this.formData.dataDeclaracao, 'MMM')} de ${this.datePipe.transform(this.formData.dataDeclaracao, 'yyyy')}.`;
    doc.setFont('Arial', 'normal');
    doc.text(textDate, marginLeft, y, { align: 'left' });
    y += lineHeight * 3;

    // Adicionar linha para assinatura
    doc.text('________________________________________', 105, y, { align: 'center' });
    y += lineHeight;

    // Adicionar nome do coordenador
    doc.text('Coordenador do Núcleo de Catequese', 105, y, { align: 'center' });

    y += lineHeight * 2; // Espaço adicional antes da segunda linha de assinatura

    // Adicionar outra linha para assinatura
    doc.text('________________________________________', 105, y, { align: 'center' });
    y += lineHeight;

    // Adicionar nome do coordenador na segunda linha de assinatura
    doc.text('Assinatura do Coordenador', 105, y, { align: 'center' });

// Salvar o arquivo PDF com o nome do catequizando
doc.save(`declaracao_catequese_${this.formData.nomeCatequizando}.pdf`);

  }
}
