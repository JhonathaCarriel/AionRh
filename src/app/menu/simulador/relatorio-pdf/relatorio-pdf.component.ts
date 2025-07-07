import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

@Component({
  selector: 'app-relatorio-pdf',
  templateUrl: './relatorio-pdf.component.html',
  styleUrls: ['./relatorio-pdf.component.scss'],
})
export class RelatorioPdfComponent implements OnInit {
  @ViewChild('pdfContainer', { static: true }) pdfContainer!: ElementRef;
  pdfDoc: any;
  pageNum: number = 1;
  pageRendering: boolean = false;
  pageNumPending: number | null = null;
  scale: number = 1.5;

  constructor() {}

  ngOnInit() {
    // Carregar o arquivo PDF
    pdfjsLib.getDocument('path/to/your/pdf.pdf').promise
      .then((pdfDoc_: pdfjsLib.PDFDocumentProxy) => {
        this.pdfDoc = pdfDoc_;
        this.renderPage(this.pageNum);
      })
      .catch((error: Error) => {
        console.error('Erro ao carregar o PDF:', error);
      });
  }

  // Renderiza a página do PDF no canvas
  renderPage(num: number) {
    if (this.pageRendering) {
      this.pageNumPending = num;
    } else {
      this.pageNum = num;
      this.pageRendering = true;

      this.pdfDoc.getPage(this.pageNum).then((page: pdfjsLib.PDFPageProxy) => {
        const viewport = page.getViewport({ scale: this.scale });

        // Cria um canvas para renderizar a página
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('Falha ao obter o contexto do canvas');
          return;
        }
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Renderiza a página PDF no contexto do canvas
        page.render({
          canvasContext: ctx,
          viewport: viewport
        }).promise.then(() => {
          // Limpa o container antes de adicionar o novo canvas
          this.pdfContainer.nativeElement.innerHTML = '';
          this.pdfContainer.nativeElement.appendChild(canvas);

          this.pageRendering = false;
          if (this.pageNumPending !== null) {
            this.renderPage(this.pageNumPending);
            this.pageNumPending = null;
          }
        }).catch((error: Error) => {
          console.error('Erro ao renderizar a página:', error);
        });
      }).catch((error: Error) => {
        console.error('Erro ao obter a página do PDF:', error);
      });
    }
  }

  // Navegação para a próxima página
  nextPage() {
    if (this.pageNum < this.pdfDoc.numPages) {
      this.renderPage(this.pageNum + 1);
    }
  }

  // Navegação para a página anterior
  prevPage() {
    if (this.pageNum > 1) {
      this.renderPage(this.pageNum - 1);
    }
  }
}
