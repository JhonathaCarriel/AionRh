import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userData: firebase.User | null = null;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ) {
    this.afAuth.authState.subscribe((user) => {
      this.userData = user;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.setItem('user', 'null');
      }
    });
  }

  // Método para cadastrar novo usuário com tratamento de erros
  async cadastrarNovoUsuario(email: string, password: string, dadosAdicionais?: any): Promise<{ success: boolean; message?: string; user?: firebase.User }> {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);

      // Atualizar perfil do usuário com dados adicionais (opcional)
      if (dadosAdicionais && userCredential.user) {
        await userCredential.user.updateProfile({
          displayName: dadosAdicionais.nome || '',
          photoURL: dadosAdicionais.fotoUrl || null
        });
      }

      // Enviar email de verificação (opcional)
      await userCredential.user?.sendEmailVerification();

      return {
        success: true,
        user: userCredential.user || undefined,
        message: 'Cadastro realizado com sucesso! Verifique seu email.'
      };
    } catch (error: any) {
      let errorMessage = 'Erro ao cadastrar usuário';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este email já está em uso.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  }

  // Métodos existentes mantidos abaixo...
  getUserEmail(): string | null {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user?.email || null;
  }

  getUserEmail$(): Observable<string | null> {
    return this.afAuth.authState.pipe(
      map(user => user?.email || null)
    );
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
      return !!userCredential?.user;
    } catch (error) {
      console.error('Erro ao autenticar usuário:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    await this.afAuth.signOut();
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user !== null && user !== 'null';
  }

  async resetPassword(email: string): Promise<void> {
    return this.afAuth.sendPasswordResetEmail(email);
  }

  async isAuthenticated(): Promise<boolean> {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user !== null && user !== 'null' && !!user.email;
  }

  async getProfile(): Promise<firebase.User | null> {
    return this.afAuth.currentUser;
  }

  getAuthState(): Observable<firebase.User | null> {
    return this.afAuth.authState;
  }
}