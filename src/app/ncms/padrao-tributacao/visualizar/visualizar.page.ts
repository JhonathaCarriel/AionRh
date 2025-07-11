import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-visualizar',
  templateUrl: './visualizar.page.html',
  styleUrls: ['./visualizar.page.scss'],
})
export class VisualizarPage implements OnInit {

  padroesTributacao: any[] = [];

  constructor(private firestore: AngularFirestore, private alertController: AlertController, private router: Router) {}


  ngOnInit() {
    this.carregarPadraoTributacao();
  }

  carregarPadraoTributacao() {
    this.firestore.collection('padraoTributacao').valueChanges({ idField: 'id' }).subscribe(data => {
      this.padroesTributacao = data;
    });
  }

  novoCadastro() {
    this.router.navigate(['/ncm/padrao/tributacao/criar']);
  }

  onSearch(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.padroesTributacao = this.padroesTributacao.filter(item =>
      item.descricaoPadraoTributacao?.toLowerCase().includes(searchTerm) ||
      item.cst?.toLowerCase().includes(searchTerm)
    );
  }

  editarCabecalho(id: string) {
    this.router.navigate([`/ncm/padrao/tributacao/editar/${id}`]);
  }

  async excluirPadrao(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar exclusão',
      message: 'Tem certeza que deseja excluir este padrão de tributação?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.firestore.collection('padraoTributacao').doc(id).delete();
          }
        }
      ]
    });

    await alert.present();
  }

}
