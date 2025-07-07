import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CommonModule } from '@angular/common'; // Importar CommonModule

@Component({
  standalone: true,
  imports: [IonicModule, CommonModule], // Adicionar CommonModule aqui
  selector: 'app-modal-informacoes-ncm',
  templateUrl: './modal-informacoes-ncm.component.html',
  styleUrls: ['./modal-informacoes-ncm.component.scss'],
})
export class ModalInformacoesNcmComponent implements OnInit {
  @Input() ncm!: string;
  @Input() cest!: string;
  @Input() uf!: string;

  ncmDetails: any;

  constructor(
    private modalController: ModalController,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.getNcmDetails();
  }

  getNcmDetails() {
    this.firestore
      .collection('ncm', (ref) =>
        ref.where('ncm', '==', this.ncm).where('cest', '==', this.cest).where('uf', '==', this.uf)
      )
      .valueChanges()
      .subscribe((data) => {
        if (data.length > 0) {
          this.ncmDetails = data[0];
        } else {
          this.ncmDetails = { error: 'Nenhum dado encontrado para este NCM e CEST.' };
        }
      });
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
