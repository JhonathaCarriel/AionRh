import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { IonicModule, ModalController, ActionSheetController } from '@ionic/angular';
import { AuthService } from '../shared/services/auth-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() pageTitle: string = 'Hórus';
  @Input() iconName: string = 'arrow-back-sharp';
  @Input() ViewPage: boolean = false;
  @Input() FormPage: boolean = false;
  currentIcon: string = '';
  usuarioNome: string = '';
  usuarios: any = [];
  userEmail: string | null = null;
  eventos: any = [];
  usuario: any | null = null;

  constructor(
    private location: Location,
    private auth: AuthService,
    private modalController: ModalController,
    private router: Router,
    private actionSheetCtrl: ActionSheetController
  ) { }

  ngOnInit() {
    this.currentIcon = this.iconName;
    this.carregaremail();
  }

  carregaremail() {
    this.userEmail = this.auth.getUserEmail();
  }

  onMouseEnter() {
    this.currentIcon = 'swap';
  }

  onMouseLeave() {
    this.currentIcon = this.iconName;
  }

  async openMenu() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Menu de Aplicativos',
      buttons: [
        {
          text: 'Tela Inicial',
          icon: 'home',
          handler: () => {
            this.router.navigateByUrl('/home');
          }
        },
        {
          text: 'Dashboards',
          icon: 'analytics',
          handler: () => {
            this.router.navigateByUrl('/dashboards');
          }
        },
        {
          text: 'Logs',
          icon: 'server',
          handler: () => {
            this.router.navigateByUrl('/logs/visualizar');
          }
        },
        {
          text: 'Simulador de Produtos',
          icon: 'calculator',
          handler: () => {
            this.router.navigateByUrl('/simulador/produtos');
          }
        },
        {
          text: 'Simulador de Serviços',
          icon: 'calculator',
          handler: () => {
            this.router.navigateByUrl('/simulador/servico');
          }
        },
        {
          text: 'Catálogos',
          icon: 'newspaper',
          handler: () => {
            this.router.navigateByUrl('/catalogos/visualizar');
          }
        },
        {
          text: 'NCMs',
          icon: 'list',
          handler: () => {
            this.router.navigateByUrl('/ncms');
          }
        },
        {
          text: 'CNAEs',
          icon: 'list',
          handler: () => {
            this.router.navigateByUrl('/simulador/cnae');
          }
        },
        {
          text: 'Fornecedores',
          icon: 'people',
          handler: () => {
            this.router.navigateByUrl('/simulador/fornecedores');
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  goBack() {
    this.modalController.getTop().then((modal) => {
      if (modal) {
        modal.dismiss();
      } else {
        this.location.back();
      }
    });
  }

  logout() {
    this.auth.logout();
  }
}