import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore'; // Importando AngularFirestore

@Component({
  selector: 'app-importar-planilha',
  templateUrl: './importar-planilha.page.html',
  styleUrls: ['./importar-planilha.page.scss'],
})
export class ImportarPlanilhaPage implements OnInit {
  @Input() data: any[] = [];
  keys: string[] = [];
  missingHeaders: string[] = [];
  statusNcm: { [key: string]: string } = {};  // Objeto para armazenar o status do NCM

  // Define the expected headers
  expectedHeaders: string[] = [
    'NCM',
    'Descrição',
    'Aliquota IPI',
    'Aliquota COFINS Entrada',
    'Aliquota COFINS Saída',
    'Aliquota ICMS',
    'Aliquota PIS Entrada',
    'Aliquota PIS Saída',
    'CEST',
    'CFOP',
    'CRT',
    'CSLL',
    'CST',
    'CST IPI',
    'CST PIS/COFINS Entrada',
    'CST PIS/COFINS Saída',
    'IRPJ',
    'MVA Aliquota 12%',
    'MVA Aliquota 4%',
    'MVA Aliquota 7%',
    'MVA Original',
    'UF'
  ];

  constructor(
    private modalController: ModalController,
    private firestore: AngularFirestore  // Injetando o AngularFirestore diretamente no componente
  ) {}

  ngOnInit() {
    // Fetch the keys to use as table headers
    if (this.data.length > 0) {
      this.keys = Object.keys(this.data[0]);
      this.validateHeaders();
    }
  }

  // Validando os cabeçalhos
  validateHeaders() {
    this.missingHeaders = this.expectedHeaders.filter(header => !this.keys.includes(header));
    if (this.missingHeaders.length > 0) {
      alert('A planilha está faltando os seguintes cabeçalhos: ' + this.missingHeaders.join(', '));
    }
  }

  // Verificando o status do NCM diretamente no Firebase
// Verificando o status do NCM diretamente no Firebase
checkNcmStatus() {
  for (const item of this.data) {
    const ncm = item['NCM'];

    // Fazendo a consulta usando 'ncm' como chave
    this.firestore.collection('ncm', ref => ref.where('ncm', '==', ncm))
      .valueChanges()
      .subscribe(response => {
        if (response && response.length > 0) {
          // Se a resposta tiver dados, o NCM está cadastrado
          this.statusNcm[ncm] = 'Cadastrado';
        } else {
          // Se não houver dados, o NCM não está cadastrado
          this.statusNcm[ncm] = 'Não Cadastrado';
        }
      }, error => {
        console.error("Erro ao consultar o Firebase:", error);
      });
  }
}

  fechar(confirm: boolean) {
    if (confirm) {
      this.modalController.dismiss({ confirm, data: this.data });
    } else {
      this.modalController.dismiss({ confirm: false });
    }
  }
}
