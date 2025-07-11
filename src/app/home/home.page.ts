import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth-service.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  userEmail: string | null = null;

  constructor(private auth: AuthService) { }

ngOnInit() {
   this.carregaremail();
  }

carregaremail(){
    this.userEmail = this.auth.getUserEmail();
  }

  logout() {
    this.auth.logout();
  }
}