import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../shared/services/auth-service.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

  ],
  providers: [
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
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

  constructor(private location: Location,
    private auth: AuthService
  ) { }



  ngOnInit() {
    this.currentIcon = this.iconName;


  }

  onMouseEnter() {
    this.currentIcon = 'swap';
  }


  onMouseLeave() {
    this.currentIcon = this.iconName;
  }

  goBack() {
    this.location.back();
  }

  logout() {
    this.auth.logout();
  }
 
}
