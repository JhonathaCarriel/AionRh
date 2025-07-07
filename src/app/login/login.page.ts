import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../shared/services/auth-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private router: Router,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required],]
    });
  }

  async login(): Promise<void> {
    if (!this.loginForm.valid) {
      await this.showToast('Por favor, preencha todos os campos corretamente.', 'danger');
      return;
    }

    const { email, password } = this.loginForm.value;
    const loading = await this.loadingCtrl.create({ message: 'Autenticando...' });
    await loading.present();

    try {
      const success = await this.authService.login(email, password);
      await loading.dismiss();

      if (success) {
        this.loginForm.reset();
        this.router.navigate(['/home']);
      } else {
        await this.showAlert('Erro de autenticação', 'Usuário ou senha incorretos.');
      }
    } catch (error) {
      await loading.dismiss();
      console.error('Erro ao autenticar:', error);
      await this.showAlert('Erro de autenticação', 'Ocorreu um erro ao tentar autenticar.');
    }
  }

  private async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color,
    });
    await toast.present();
  }
}
