import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { FirebaseNCMService } from '../services/firebase-ncm.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';




export interface NCM{
  id: string,
  uf: string,
  crt: string,
  ncm: string,
  cest:string,
  descricao: string,
  cstIPI:  string,
  aliquotaIPI: string,
  cstpiscofinsEntrada:  string,
  cstpiscofinsSaida:  string,
  aliquotapisEntrada:string,
  aliquotapisSaida: string,
  aliquotacofinsEntrada: string,
  aliquotacofinsSaida: string,
  cfop: string,
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
    private modal: ModalController,
    private alertController: AlertController,
    private firestore: AngularFirestore,
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
    console.log('Salvando os seguintes NCMs:', this.ncms);
  
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
            console.log('Exclusão cancelada');
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
      console.log('NCM excluído com sucesso');
    }).catch(error => {
      alert('Erro ao excluir NCM')
      console.error('Erro ao excluir NCM: ', error);
    });
  }

  onSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.filterItems();
  }

  filterItems() {
    if (this.searchTerm.trim() === '') {
      // Reload data if search term is empty
      this.loadncm();
    } else {
      this.ncms = this.ncms.filter(item => 
        item.descricao.includes(this.searchTerm) || 
        item.ncm.includes(this.searchTerm)
      );
    }
  }

  onSearchChange() {
    this.filterItems();
  }
  
}
