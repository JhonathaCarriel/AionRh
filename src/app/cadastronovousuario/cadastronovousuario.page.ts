import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../shared/services/auth-service.service';


@Component({
  selector: 'app-cadastronovousuario',
  templateUrl: './cadastronovousuario.page.html',
  styleUrls: ['./cadastronovousuario.page.scss'],
})
export class CadastronovousuarioPage implements OnInit {
  cadastroUsuarioForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    this.cadastroUsuarioForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.matchingPasswords('password', 'confirmPassword') });
  }

  ngOnInit() {
  }

  // Validador customizado para verificar se as senhas coincidem
  matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (group: FormGroup) => {
      const password = group.controls[passwordKey];
      const confirmPassword = group.controls[confirmPasswordKey];

      if (password.value !== confirmPassword.value) {
        return confirmPassword.setErrors({ mismatchedPasswords: true });
      }
    };
  }

  async salvarUsuario() {
    if (this.cadastroUsuarioForm.invalid) {
      this.mostrarAlerta('Formulário inválido', 'Por favor, preencha todos os campos corretamente.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Criando sua conta...'
    });
    await loading.present();

    try {
      const { email, password } = this.cadastroUsuarioForm.value;

      const result = await this.authService.cadastrarNovoUsuario(email, password);

      if (result.success) {
        await this.mostrarAlerta('Sucesso!', 'Conta criada com sucesso. Verifique seu email para confirmar.');
        this.router.navigate(['/login']);
      } else {
        await this.mostrarAlerta('Erro', result.message || 'Ocorreu um erro ao criar a conta.');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      await this.mostrarAlerta('Erro', 'Ocorreu um erro inesperado. Tente novamente mais tarde.');
    } finally {
      await loading.dismiss();
    }
  }

  private async mostrarAlerta(titulo: string, mensagem: string) {
    const alert = await this.alertCtrl.create({
      header: titulo,
      message: mensagem,
      buttons: ['OK']
    });
    await alert.present();
  }
}