import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

export interface CNAEs {
  id: string;
  crt: string;
  uf: string;
  cidade: string;
  cnae: string;
  descricao: string;
  aliquotapisSaida: number;
  aliquotacofinsSaida:number;
  aliquotaISS: number;
  csllRetido: number;
  irpj: number;
  csll: number;
}

@Component({
  selector: 'app-cnae',
  templateUrl: './cnae.page.html',
  styleUrls: ['./cnae.page.scss'],
})
export class CnaePage implements OnInit {
  pageTitle: string = 'CNAE';
  searchTerm: string = '';
  TitleSubheader: string = '';
  cnaes: CNAEs[] = [];


  constructor(
    private router: Router,
    private firestore: AngularFirestore,
    private alertController: AlertController,
  ) { }

  ngOnInit() {
    this.loadCadastroCNAE();
    this.carregarDadosCNAE();
  }

  carregarDadosCNAE() {
    this.firestore.collection<CNAEs>('cnae', ref => ref.orderBy('uf'))
      .snapshotChanges()
      .subscribe((snapshot) => {
        this.cnaes = snapshot.map(a => {
          const data = a.payload.doc.data() as CNAEs;
          const id = a.payload.doc.id;
          return { ...data, id };
        });
      });
  }


  loadCadastroCNAE(){
    console.log('loadCadastroCNAE');
  }

  novoCadastroCNAE(){
  this.router.navigate(['simulador/cnae/criar']);
  }
  filterItems() {
    if (this.searchTerm.trim() === '') {

      this.loadCadastroCNAE();
    } else {
      this.cnaes = this.cnaes.filter(item =>
        item.cnae.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.descricao.toLowerCase().includes(this.searchTerm.toLowerCase())||
        item.cidade.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  onSearchChange() {
    this.filterItems();
  }

  onSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.filterItems();
  }

  async confirmarExclusao(id: string, event: Event) {
    event.stopPropagation();
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: 'Você tem certeza que deseja excluir este CNAE?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Exclusão cancelada');
          }
        }, {
          text: 'Excluir',
          handler: () => {
            this.excluirCNAE(id, event);
          }
        }
      ]
    });

    await alert.present();
  }

  excluirCNAE(id: string, event: Event) {
    event.stopPropagation();
    this.firestore.collection('cnae').doc(id).delete().then(() => {
      console.log('CNAE excluído com sucesso');
    }).catch(error => {
      console.error('Erro ao excluir colaborador: ', error);
    });
  }
  editarCNAE(cnae: CNAEs) {
    this.router.navigate(['/simulador/cnae/editar', cnae.id]);
  }



}
