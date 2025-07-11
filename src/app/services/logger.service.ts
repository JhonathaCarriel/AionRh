import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private readonly LOGS_COLLECTION = 'logs';

  constructor(private firestore: AngularFirestore) {}

  async registrarLog(
    tipoOperacao: 'criacao' | 'atualizacao' | 'exclusao' | 'erro' | 'consulta',
    colecaoAlvo: string,
    documentoAlvoId: string,
    dadosNovos?: any,
    dadosAntigos?: any,
    mensagem?: string
  ): Promise<void> {
    try {
      const usuario = firebase.auth().currentUser?.email || 'anonimo';

      const logData = {
        dataHora: firebase.firestore.FieldValue.serverTimestamp(),
        usuario,
        tipoOperacao,
        colecaoAlvo,
        documentoAlvoId,
        ...(dadosNovos && { dadosNovos: this.sanitizeData(dadosNovos) }),
        ...(dadosAntigos && { dadosAntigos: this.sanitizeData(dadosAntigos) }),
        ...(mensagem && { mensagem })
      };

      await this.firestore.collection(this.LOGS_COLLECTION).add(logData);
    } catch (error) {
      console.error('Erro ao registrar log:', error);
      // Pode adicionar fallback como localStorage ou enviar para um serviço de monitoramento
    }
  }

  private sanitizeData(data: any): any {
    if (!data) return data;

    const sensitiveFields = ['senha', 'password', 'token', 'accessToken'];
    const sanitized = Array.isArray(data) ? [...data] : {...data};

    for (const field in sanitized) {
      if (sensitiveFields.includes(field.toLowerCase())) {
        sanitized[field] = '***REMOVED***';
      } else if (typeof sanitized[field] === 'object') {
        sanitized[field] = this.sanitizeData(sanitized[field]);
      }
    }

    return sanitized;
  }
}