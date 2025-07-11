import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { FirebaseNCMService } from '../services/firebase-ncm.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ImportarPlanilhaPage } from './importar-planilha/importar-planilha.page';





export interface NCM{
  id: string,
  uf: string,
  crt: string,
  ncm: string,
  cest:string,
  descricao: string,
  cstIPI:  string,
  aliquotaIPI: number,
  cstpiscofinsEntrada:  string,
  cstpiscofinsSaida:  string,
  aliquotapisEntrada:number,
  aliquotapisSaida: number,
  aliquotacofinsEntrada: number,
  aliquotacofinsSaida: number,
  cst:  string,
  aliquotaicms: string,
  mvaOriginal: number,
  mvaAliquota12: number,
  mvaAliquota7: number,
  mvaAliquota4: number,
  irpj: number,
  csll:number
}

@Component({
  selector: 'app-ncms',
  templateUrl: './ncms.page.html',
  styleUrls: ['./ncms.page.scss'],
})
export class NcmsPage implements OnInit {
  pageTitle: string = 'Grupo de NCMs';
  TitleSubheader: string = '';
  ncms: NCM[] = [];
  todosSelecionados: boolean = false;
  searchTerm: string = '';


  constructor(
    public router: Router,
    private modalController: ModalController,
    private alertController: AlertController,
    private firestore: AngularFirestore,
    private loadingController: LoadingController,
    private FirebaseNCMService: FirebaseNCMService) { }

  ngOnInit() {
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
  salvarCadastro() {


  }
  novoCadastroNCM(){
    this.router.navigate(['/cadastro/ncm']);
  }

  editar(ncm: NCM) {
    this.router.navigate(['/editar/ncm', ncm.id]);
  }



  async confirmarExclusao(id: string, event: Event) {
    event.stopPropagation();
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: 'Você tem certeza que deseja excluir este NCM?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {

          }
        }, {
          text: 'Excluir',
          handler: () => {
            this.excluirNCM(id, event);
          }
        }
      ]
    });

    await alert.present();
  }

  excluirNCM(id: string, event: Event) {
    event.stopPropagation();
    this.firestore.collection('ncm').doc(id).delete().then(() => {
      alert('NCM excluído com sucesso')

    }).catch(error => {
      alert('Erro ao excluir NCM')

    });
  }

  onSearchChange() {
    this.filterItems();
  }

  onSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.filterItems();
  }

  filterItems() {
    if (this.searchTerm.trim() === '') {
      this.loadncm();
    } else {
      const term = this.searchTerm.toLowerCase();
      this.ncms = this.ncms.filter(item => {
        const descricao = item.descricao ? item.descricao.toString().toLowerCase() : '';
        const ncm = item.ncm ? item.ncm.toString().toLowerCase() : '';

        return descricao.includes(term) || ncm.includes(term);
      });
    }
  }

  async importarPlanilhaNCM(files: FileList) {
    if (files && files.length > 0) {
      const arquivo = files[0];
      const reader = new FileReader();

      reader.onload = async (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Assume que os dados estão na primeira planilha
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Converta os dados para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);


        // Pergunta se deseja importar
        const confirm = await this.confirmarImportacao();
        if (confirm) {
          // Salva os dados no Firebase
          await this.salvarDadosNoFirebase(jsonData);
          // Recarrega os dados
          this.loadncm();
        }
      };

      reader.readAsArrayBuffer(arquivo);
    }
  }

  async confirmarImportacao(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Confirmar Importação',
        message: 'Deseja realmente importar os dados da planilha?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'Importar',
            handler: () => resolve(true)
          }
        ]
      });

      await alert.present();
    });
  }

  async salvarDadosNoFirebase(dados: any[]) {
    const ncmCollection = this.firestore.collection('ncm');

    const atualizados: any[] = [];
    const novos: any[] = [];

    const loading = await this.loadingController.create({
      message: 'Importando NCMs...',
      spinner: 'lines'
    });
    await loading.present();

    try {
      let contador = 0;
      const total = dados.length;

      for (const item of dados) {
        contador++;

        // Normaliza e valida os campos obrigatórios
        const ncm = item.ncm?.toString().trim();
        const cest = item.cest?.toString().trim();
        const uf = item.uf?.toString().trim();

        if (!ncm || !cest || !uf) continue;

        const dadosFormatados = {
          uf,
          crt: item.crt?.toString().trim() || '',
          ncm,
          cest,
          descricao: item.descricao?.toString().trim() || '',
          cstIPI: item.cstIPI?.toString().trim() || '',
          aliquotaIPI: parseFloat(item.aliquotaIPI) || 0,
          cstpiscofinsEntrada: item.cstpiscofinsEntrada?.toString().trim() || '',
          cstpiscofinsSaida: item.cstpiscofinsSaida?.toString().trim() || '',
          aliquotapisEntrada: parseFloat(item.aliquotapisEntrada) || 0,
          aliquotapisSaida: parseFloat(item.aliquotapisSaida) || 0,
          aliquotacofinsEntrada: parseFloat(item.aliquotacofinsEntrada) || 0,
          aliquotacofinsSaida: parseFloat(item.aliquotacofinsSaida) || 0,
          cst: item.cst?.toString().trim() || '',
          aliquotaicms: item.aliquotaicms?.toString().trim() || '',
          mvaOriginal: parseFloat(item.mvaOriginal) || 0,
          mvaAliquota12: parseFloat(item.mvaAliquota12) || 0,
          mvaAliquota7: parseFloat(item.mvaAliquota7) || 0,
          mvaAliquota4: parseFloat(item.mvaAliquota4) || 0,
          irpj: parseFloat(item.irpj) || 0,
          csll: parseFloat(item.csll) || 0
        };

        const querySnapshot = await ncmCollection.ref
          .where('ncm', '==', ncm)
          .where('cest', '==', cest)
          .where('uf', '==', uf)
          .get();

        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;
          await docRef.update(dadosFormatados);
          atualizados.push(dadosFormatados);
        } else {
          await ncmCollection.add(dadosFormatados);
          novos.push(dadosFormatados);
        }

        loading.message = `Importando NCMs (${contador} de ${total})...`;
      }

      await loading.dismiss();

      const mensagem = `
        Total de registros: ${total}<br>
        Novos cadastros: ${novos.length}<br>
        Atualizados: ${atualizados.length}
      `;
      this.mostrarAlerta('Importação Finalizada', mensagem);

    } catch (error) {
      await loading.dismiss();
      this.mostrarAlerta('Erro', 'Ocorreu um erro ao importar os dados.');
      console.error(error);
    }
  }


  async mostrarAlerta(titulo: string, mensagem: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensagem,
      buttons: ['OK']
    });

    await alert.present();
  }


  exportarParaExcel(event?: any): void {
    const dadosExportacao = this.ncms.map((ncm: any) => ({
      'UF': ncm.uf,
      'NCM': ncm.ncm,
      'Descrição': ncm.descricao,
      'CEST': ncm.cest,
      'CST': ncm.cst,
      'CST IPI': ncm.cstIPI,
      'CST PIS/COFINS Entrada': ncm.cstpiscofinsEntrada,
      'CST PIS/COFINS Saída': ncm.cstpiscofinsSaida,
      'Alíquota ICMS (%)': ncm.aliquotaicms,
      'Alíquota IPI (%)': ncm.aliquotaIPI,
      'Alíquota PIS Entrada (%)': ncm.aliquotapisEntrada,
      'Alíquota PIS Saída (%)': ncm.aliquotapisSaida,
      'Alíquota COFINS Entrada (%)': ncm.aliquotacofinsEntrada,
      'Alíquota COFINS Saída (%)': ncm.aliquotacofinsSaida,
      'IRPJ (%)': ncm.irpj,
      'CSLL (%)': ncm.csll,
      'MVA Original (%)': ncm.mvaOriginal,
      'MVA 4% (%)': ncm.mvaAliquota4,
      'MVA 7% (%)': ncm.mvaAliquota7,
      'MVA 12% (%)': ncm.mvaAliquota12
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dadosExportacao);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'NCMs': worksheet },
      SheetNames: ['NCMs']
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const nomeArquivo = `dados_ncm_exportacao_${new Date().getTime()}.xlsx`;
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(data, nomeArquivo);
  }

}
