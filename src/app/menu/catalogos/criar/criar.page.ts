import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { finalize } from 'rxjs';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-criar',
  templateUrl: './criar.page.html',
  styleUrls: ['./criar.page.scss'],
})
export class CriarPage implements OnInit {
  catalogoForm: FormGroup;
  expandedGroups: boolean[] = [];
  catalogoId: string = '';


  constructor(
    private fb: FormBuilder,
    private firestore: AngularFirestore,
   private storage: AngularFireStorage,
   private route: ActivatedRoute
  )
  {
    this.catalogoForm = this.fb.group({
      nome: ['CATÁLOGO AGRÍCOLA E CONSTRUÇÃO', Validators.required],
      descricao: ['CATÁLOGO AGRÍCOLA E CONSTRUÇÃO'],
      fabricante: ['Suporte Máquinas'],
      dataCadastro: ['2025-05-17'],
      paginasPersonalizadas: this.fb.array([]), // Novo FormArray para páginas personalizadas
      criarIndice: [false],
      indice: this.fb.array([]),
      gruposDeItens: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.catalogoId = this.route.snapshot.paramMap.get('id')!;
  }

  get gruposDeItens(): FormArray {
    return this.catalogoForm.get('gruposDeItens') as FormArray;
  }

  get indice(): FormArray {
    return this.catalogoForm.get('indice') as FormArray;
  }

  get paginasPersonalizadas(): FormArray {
    return this.catalogoForm.get('paginasPersonalizadas') as FormArray;
  }

  novaPaginaPersonalizada(): FormGroup {
    return this.fb.group({
      numeroPagina: ['', Validators.pattern('^[0-9]*$')],
      nomePagina: [''],
      imagemPagina: [''],
      exibirItens: [false],
      sequencia: ['', Validators.pattern('^[0-9]*$')], // Para ordenar as páginas
    });
  }

  adicionarPaginaPersonalizada() {
    this.paginasPersonalizadas.push(this.novaPaginaPersonalizada());
    this.paginasPersonalizadas.controls.sort((a, b) => (a.get('sequencia')?.value > b.get('sequencia')?.value ? 1 : -1));
  }

  removerPaginaPersonalizada(index: number) {
    this.paginasPersonalizadas.removeAt(index);
  }

  novoGrupoDeItens(): FormGroup {
    return this.fb.group({
      nomeDoGrupo: ['', Validators.required],
      paginaIndice: [''],
      imagemGrupo: [''],
      itensColados: [''],
      itens: this.fb.array([]),
    });
  }

  novoItem(itemData: string[] = ['', '', '', '', '', '', '', '']): FormGroup {
    return this.fb.group({
      referenciaInterna: [itemData[0]],
      codigo: [itemData[1]],
      haste: [itemData[2]],
      embolo: [itemData[3]],
      descricao: [itemData[4]],
      cilindro: [itemData[5]],
      equipamento: [itemData[6]],
      marca: [itemData[7]],
    });
  }

  novoItemIndice(): FormGroup {
    return this.fb.group({
      nomeDoGrupoIndice: ['', Validators.required],
      paginaIndice: ['', Validators.pattern('^[0-9]*$')],
    });
  }

// Adicione esta função para evitar o fechamento da aba ao clicar no botão de remover
removerGrupoDeItens(index: number, event?: Event) {
  if (event) {
    event.stopPropagation(); // Impede a propagação do evento para não interferir com o sistema de abas
  }
  this.gruposDeItens.removeAt(index);
  if (this.catalogoForm.get('criarIndice')?.value && this.indice.length > index) {
    this.indice.removeAt(index);
  }
}

// Modifique a função adicionarGrupoDeItens para ativar a nova aba
adicionarGrupoDeItens() {
  const novoGrupo = this.novoGrupoDeItens();
  this.gruposDeItens.push(novoGrupo);
  if (this.catalogoForm.get('criarIndice')?.value) {
    this.adicionarItemIndice(novoGrupo);
  }

  // Ativar a nova aba após um pequeno delay para garantir que o DOM foi atualizado
  setTimeout(() => {
    const newTabIndex = this.gruposDeItens.length - 1;
    const newTab = document.querySelector(`#nav-grupo-${newTabIndex}-tab`);
    if (newTab) {
      (newTab as HTMLElement).click();
    }
  }, 100);
}
  getItensDoGrupo(grupoIndex: number): FormArray {
    const grupo = this.gruposDeItens.controls[grupoIndex] as FormGroup;
    return grupo.get('itens') as FormArray;
  }

  adicionarItem(grupoIndex: number) {
    this.getItensDoGrupo(grupoIndex).push(this.novoItem());
  }

  removerItem(grupoIndex: number, itemIndex: number) {
    this.getItensDoGrupo(grupoIndex).removeAt(itemIndex);
  }

  processarItensColados(grupoIndex: number) {
    const grupo = this.gruposDeItens.controls[grupoIndex] as FormGroup;
    const itensColados = grupo.get('itensColados')?.value;

    if (itensColados) {
      const linhas: string[] = itensColados.split('\n').filter((linha: string) => linha.trim() !== '');
      linhas.forEach(linha => {
        const campos = linha.split('\t');
        this.getItensDoGrupo(grupoIndex).push(this.novoItem(campos));
      });
      grupo.get('itensColados')?.setValue('');
    }
  }

  alternarCriarIndice() {
    const criarIndiceAtivo = this.catalogoForm.get('criarIndice')?.value;
    if (criarIndiceAtivo && this.gruposDeItens.controls.length > this.indice.controls.length) {
      this.gruposDeItens.controls.forEach(grupo => {
        this.adicionarItemIndice(grupo as FormGroup);
      });
    } else if (!criarIndiceAtivo) {
      this.indice.clear();
    }
  }

  adicionarItemIndice(grupo: FormGroup) {
    this.indice.push(
      this.fb.group({
        nomeDoGrupoIndice: [grupo.get('nomeDoGrupo')?.value, Validators.required],
        paginaIndice: [grupo.get('paginaIndice')?.value, Validators.pattern('^[0-9]*$')],
      })
    );
  }

// Corrigir o método onFileSelected
onFileSelected(event: any, grupoIndex: number) {
  const file: File = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // Acessar o grupo específico e definir a imagem
      const grupo = this.gruposDeItens.controls[grupoIndex] as FormGroup;
      grupo.get('imagemGrupo')?.setValue(e.target.result);
    };
    reader.readAsDataURL(file);
  }
}

  onFileSelectedPagina(event: any, index: number) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.paginasPersonalizadas.controls[index].get('imagemPagina')?.setValue(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }



  descartar() {
    this.catalogoForm.reset();
    // Aqui você pode adicionar a lógica para descartar as alterações
  }


  exportarPDF() {
    const doc = new jsPDF();
    const fileName = `${this.catalogoForm.get('nome')?.value || 'catalogo'}.pdf`;
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const marginTop = 60;

    const verdeEscuro = [0, 100, 0];
    const verdeClaro = [230, 255, 230];

    const paginas = this.paginasPersonalizadas.controls.sort((a, b) => {
      const seqA = Number(a.get('sequencia')?.value || 0);
      const seqB = Number(b.get('sequencia')?.value || 0);
      return seqA - seqB;
    });

    const grupos = this.gruposDeItens.controls;

    paginas.forEach((paginaControl, paginaIndex) => {
      const pagina = paginaControl.value;

      if (paginaIndex > 0) doc.addPage();

      if (pagina.imagemPagina) {
        doc.addImage(pagina.imagemPagina, 'JPEG', 0, 0, width, height);
        doc.setDrawColor(0);
        doc.setLineWidth(1);
        doc.rect(0.5, 0.5, width - 1, height - 1);
      }

// Removido: exibição do nome da página
// if (pagina.nomePagina) {
//   doc.setFontSize(20);
//   doc.setTextColor(0);
//   doc.setFont('helvetica', 'bold');
//   doc.text(pagina.nomePagina, width / 2, 20, { align: 'center' });
// }

      if (pagina.exibirItens) {
        grupos.forEach((grupoControl, grupoIndex) => {
          if (paginaIndex > 0 || grupoIndex > 0) doc.addPage();

          if (pagina.imagemPagina) {
            doc.addImage(pagina.imagemPagina, 'JPEG', 0, 0, width, height);
            doc.setDrawColor(0);
            doc.setLineWidth(1);
            doc.rect(0.5, 0.5, width - 1, height - 1);
          }

          let currentY = marginTop;

          if (grupoControl.value.imagemGrupo && typeof grupoControl.value.imagemGrupo === 'string') {
            const imgWidth = 80;
            const imgHeight = 60;
            const imgX = (width - imgWidth) / 2;
            try {
              doc.addImage(grupoControl.value.imagemGrupo, 'JPEG', imgX, currentY, imgWidth, imgHeight);
              currentY += imgHeight + 10;
            } catch (err) {
              console.warn('Erro ao carregar imagem do grupo:', err);
              currentY += 10;
            }
          }

          doc.setFontSize(16);
          doc.setTextColor(0);
          doc.setFont('helvetica', 'normal');
          doc.text(grupoControl.value.nomeDoGrupo || 'Grupo sem nome', width / 2, currentY, { align: 'center' });
          currentY += 10;

          const itens = grupoControl.value.itens || [];

          if (itens.length > 0) {
            const sanitize = (val: any, maxLen = 100) => {
              if (val == null) return '';
              const str = String(val).replace(/\s+/g, ' ').trim();
              return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
            };

            const tableData = itens.map((item: any) => [
              sanitize(item.referenciaInterna, 30),
              sanitize(item.codigo, 20),
              sanitize(item.haste, 10),
              sanitize(item.embolo, 10),
              sanitize(item.descricao, 50),
              sanitize(item.cilindro, 20),
              sanitize(item.equipamento, 30),
              sanitize(item.marca, 25),
            ]);

            (doc as any).autoTable({
              head: [[
                'Referência', 'Código', 'Haste', 'Êmbolo',
                'Descrição', 'Cilindro', 'Equipamento', 'Marca'
              ]],
              body: tableData,
              startY: currentY + 10,
              margin: { left: 10, right: 10 },
              styles: {
                fontSize: 7,
                font: 'helvetica',
                cellPadding: 1,
                overflow: 'linebreak',
                valign: 'middle',
                halign: 'center',
                minCellHeight: 4,
              },
              headStyles: {
                fillColor: verdeEscuro,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
              },
              alternateRowStyles: {
                fillColor: verdeClaro,
              },
              columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 20 },
                2: { cellWidth: 15 },
                3: { cellWidth: 15 },
                4: { cellWidth: 40 },
                5: { cellWidth: 20 },
                6: { cellWidth: 30 },
                7: { cellWidth: 25 },
              },
              theme: 'grid',
              showHead: 'everyPage',
              rowPageBreak: 'avoid',
              pageBreak: 'auto',
            });
          } else {
            doc.setFontSize(12);
            doc.setTextColor(150);
            doc.text('Nenhum item cadastrado neste grupo.', width / 2, currentY + 10, { align: 'center' });
          }
        });
      }
    });

    const totalPages = (doc as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      const footerText = `Criado por Horus Plataforma - Página ${i} de ${totalPages}`;
      doc.text(footerText, width / 2, height - 10, { align: 'center' });
    }

    try {
      const pdfBlob = doc.output('blob');
      if (pdfBlob instanceof Blob) {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
      } else {
        console.error('Erro: saída do PDF não é um Blob válido.');
      }
    } catch (error) {
      console.error('Erro ao gerar o PDF:', error);
    }
  }

  toggleGrupo(index: number) {
    this.expandedGroups[index] = !this.expandedGroups[index];
  }

  salvarCatalogo() {
  const dadosCatalogo = this.catalogoForm.value;

  this.firestore.collection('cabecalhoCatalogo').add({
    nome: dadosCatalogo.nome,
    descricao: dadosCatalogo.descricao,
    fabricante: dadosCatalogo.fabricante,
    dataCadastro: dadosCatalogo.dataCadastro,
    criarIndice: dadosCatalogo.criarIndice,
  }).then(async (docRef) => {
    const catalogoId = docRef.id;

    // SALVAR PÁGINAS PERSONALIZADAS
    for (let i = 0; i < dadosCatalogo.paginasPersonalizadas.length; i++) {
      const pagina = dadosCatalogo.paginasPersonalizadas[i];
      let imagemUrl = '';

      if (pagina.imagemPagina) {
        const file = pagina.imagemPagina;
        const path = `paginasPersonalizadas/${catalogoId}_${i}_${file.name}`;
        const fileRef = this.storage.ref(path);
        await this.storage.upload(path, file).snapshotChanges().pipe(
          finalize(async () => {
            imagemUrl = await fileRef.getDownloadURL().toPromise();

            await this.firestore.collection(`cabecalhoCatalogo/${catalogoId}/paginasPersonalizadas`).add({
              catalogoId: catalogoId,
              sequencia: pagina.sequencia,
              numeroPagina: pagina.numeroPagina,
              nomePagina: pagina.nomePagina,
              exibirItens: pagina.exibirItens,
              imagemUrl: imagemUrl
            });
          })
        ).toPromise();
      } else {
        await this.firestore.collection(`cabecalhoCatalogo/${catalogoId}/paginasPersonalizadas`).add({
          catalogoId: catalogoId,
          sequencia: pagina.sequencia,
          numeroPagina: pagina.numeroPagina,
          nomePagina: pagina.nomePagina,
          exibirItens: pagina.exibirItens,
          imagemUrl: ''
        });
      }
    }

    // SALVAR ITENS DO GRUPO
    for (let i = 0; i < dadosCatalogo.gruposDeItens.length; i++) {
      const grupo = dadosCatalogo.gruposDeItens[i];
      const nomeGrupo = grupo.nomeDoGrupo.replace(/\s+/g, '_');

      for (let j = 0; j < grupo.itens.length; j++) {
        const item = grupo.itens[j];
        await this.firestore.collection(`grupoDeItens_${nomeGrupo}`).add({
          catalogoId: catalogoId,
          nomeGrupo: grupo.nomeDoGrupo,
          referenciaInterna: item.referenciaInterna,
          codigo: item.codigo,
          haste: item.haste,
          embolo: item.embolo,
          descricao: item.descricao,
          cilindro: item.cilindro,
          equipamento: item.equipamento,
          marca: item.marca,
          paginaIndice: grupo.paginaIndice || null
        });
      }
    }

    alert('Catálogo salvo com sucesso!');
  });
}


}