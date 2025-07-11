import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, Routes } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/header/header.component';
import { SubheaderComponent } from 'src/app/subheader/subheader.component';
export interface Fornecedores{
  id: string,
  cnpj: string,
  nomeEmpresa:  string,
  razaoSocial: string,
  estado:  string,
  municipio: string,
  logradouro:  string,
  numero:  string,
  bairro:  string,
  cep:  string,
  telefone1: string,
  telefone2:  string,

  atividadeFornecedor:  string,
  nfeCompraFornecedor:  string,
  tipoDeEmpresa:  string,
}

@Component({
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    HeaderComponent,
    SubheaderComponent,ReactiveFormsModule
  ],


  selector: 'app-fornecedores',
  templateUrl: './fornecedores.component.html',
  styleUrls: ['./fornecedores.component.scss'],
})
export class FornecedoresComponent  implements OnInit {

  pageTitle: string = 'Empresas'
  TitleSubheader: string = ''

  fornecedores: Fornecedores[]=[]

  constructor(
    private router: Router,
    private firestore: AngularFirestore,
    private alertController: AlertController,
  ) { }

  ngOnInit() {
    this.carregarDadosFornecedor();
  }

  carregarDadosFornecedor() {
    this.firestore.collection<Fornecedores>('fornecedor', ref => ref.orderBy('nomeEmpresa'))
      .snapshotChanges()
      .subscribe((snapshot) => {
        this.fornecedores = snapshot.map(a => {
          const data = a.payload.doc.data() as Fornecedores;
          const id = a.payload.doc.id;
          return { ...data, id };
        });
      });
  }


  novoCadastroFornecedor(){
    this.router.navigate(['/simulador/fornecedores/criar'])

  }

  openEditar(fornecedor: Fornecedores) {
    // Redireciona para a página de edição de fornecedor
    this.router.navigate(['/simulador/fornecedores/editar', fornecedor.id]);
  }

  async confirmarExclusao(id: string, event: Event) {
    event.stopPropagation();
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: 'Você tem certeza que deseja excluir este cadastro?',
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
            this.excluirContrato(id, event);
          }
        }
      ]
    });

    await alert.present();
  }

  excluirContrato(id: string, event: Event) {
    event.stopPropagation();
    this.firestore.collection('fornecedor').doc(id).delete().then(() => {
      console.log('Empresa excluída com sucesso');
    }).catch(error => {
      console.error('Erro ao excluir Contrato: ', error);
    });
  }

}
