import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseNCMService {
  ncmDetails: any;
  constructor(private firestore: AngularFirestore) { }

  saveNCMDados(ncmData: any): Promise<void> {
    const ncmRef = this.firestore.collection('ncm');
    return ncmRef.add(ncmData)
      .then(() => {
        console.log("Dados salvos com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao salvar dados: ", error);
        throw error;
      });
  }

  consultaNCM(): Observable<any[]>{
    return this.firestore.collection('ncm').valueChanges();

  }

  async atualizaNCM(id: string, ncmData: any) {
    try {
      const ncmRef = this.firestore.doc(`ncm/${id}`);

      // Verifica se o documento existe antes de atualizar
      const docSnap = await ncmRef.get();
      if (!docSnap) {
        console.error('Documento não encontrado para atualização:', id);
        return; // Ou lance uma exceção personalizada
      }

      // Atualiza o documento
      await ncmRef.update(ncmData);

      console.log('NCM atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar NCM:', error);
      // Trate o erro de acordo com a sua aplicação (ex: mostrar mensagem de erro ao usuário)
    }
  }
  deletarNCM(id: string): Promise<void> {
    return this.firestore.collection('ncm').doc(id).delete();
  }
  verificarDuplicidadeCompleta(dados: any): Promise<boolean> {
    return this.firestore.collection('ncm', ref => ref
      .where('uf', '==', dados.uf)
      .where('crt', '==', dados.crt)
      .where('ncm', '==', dados.ncm)
      .where('cest', '==', dados.cest)
      .where('descricao', '==', dados.descricao)
      .where('cstIPI', '==', dados.cstIPI)
      .where('aliquotaIPI', '==', dados.aliquotaIPI)
      .where('cstpiscofinsEntrada', '==', dados.cstpiscofinsEntrada)
      .where('cstpiscofinsSaida', '==', dados.cstpiscofinsSaida)
      .where('aliquotapisEntrada', '==', dados.aliquotapisEntrada)
      .where('aliquotapisSaida', '==', dados.aliquotapisSaida)
      .where('aliquotacofinsEntrada', '==', dados.aliquotacofinsEntrada)
      .where('aliquotacofinsSaida', '==', dados.aliquotacofinsSaida)
      .where('cst', '==', dados.cst)
      .where('aliquotaicms', '==', dados.aliquotaicms)
      .where('mvaOriginal', '==', dados.mvaOriginal)
      .where('mvaAliquota12', '==', dados.mvaAliquota12)
      .where('mvaAliquota7', '==', dados.mvaAliquota7)
      .where('mvaAliquota4', '==', dados.mvaAliquota4)
    )
      .get()
      .toPromise()
      .then((snapshot) => {
        if (!snapshot) {
          return false;
        }
        return !snapshot.empty;
      })
      .catch((error) => {
        console.error('Erro ao verificar duplicidade', error);
        throw error;
      });
  }
  searchNcm(searchTerm: string): Observable<any[]> {
    return this.firestore
      .collection('ncm', ref => ref
        .orderBy('descricao') // Campo pelo qual deseja ordenar
        .startAt(searchTerm)
        .endAt(searchTerm + '\uf8ff') // Usado para buscar por prefixo
      )
      .valueChanges(); // Obtém os dados
  }


  consultaNCMVenda(ncmVenda: string, ufVarejista: string, cestVenda: string): Observable<any[]> {
    return this.firestore
      .collection('ncm', ref =>
        ref.where('ncm', '==', ncmVenda)
           .where('uf', '==', ufVarejista)
           .where('cestCompra', '==', cestVenda)
      )
      .valueChanges()
      .pipe(
        map((data: any[]) => {
          if (data.length > 0) {
            const ncmData = data[0]; // First document from the result
            // Return an array with one object inside
            return [{
              irpj: ncmData.irpj,
              csll: ncmData.csll,
              aliquotacofinsSaida: ncmData.aliquotacofinsSaida,
              aliquotapisSaida: ncmData.aliquotapisSaida,
              aliquotaicms: ncmData.aliquotaicms
            }];
          }
          return []; // Return an empty array if no data matches
        }),
        catchError(error => {
          console.error('Error fetching data from Firestore:', error);
          return of([]); // Return an empty array in case of error
        })
      );
  }

  savePadraoTributacao(PadraoTributacaoData: any): Promise<void> {
    const ncmRef = this.firestore.collection('padraoTributacao');
    return ncmRef.add(PadraoTributacaoData)
      .then(() => {
        console.log("Dados salvos com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao salvar dados: ", error);
        throw error;
      });
  }
  verificarDuplicidadeCompletaPadraoTributacao(dados: any): Promise<boolean> {
    return this.firestore.collection('padraoTributacao', ref => ref
      .where('descricaoPadraoTributacao', '==', dados.descricaoPadraoTributacao)
      .where('cstIPI', '==', dados.cstIPI)
      .where('aliquotaIPI', '==', dados.aliquotaIPI)
      .where('cstpiscofinsEntrada', '==', dados.cstpiscofinsEntrada)
      .where('cstpiscofinsSaida', '==', dados.cstpiscofinsSaida)
      .where('aliquotapisEntrada', '==', dados.aliquotapisEntrada)
      .where('aliquotapisSaida', '==', dados.aliquotapisSaida)
      .where('aliquotacofinsEntrada', '==', dados.aliquotacofinsEntrada)
      .where('aliquotacofinsSaida', '==', dados.aliquotacofinsSaida)
      .where('cst', '==', dados.cst)
      .where('aliquotaicms', '==', dados.aliquotaicms)
      .where('mvaOriginal', '==', dados.mvaOriginal)
      .where('mvaAliquota12', '==', dados.mvaAliquota12)
      .where('mvaAliquota7', '==', dados.mvaAliquota7)
      .where('mvaAliquota4', '==', dados.mvaAliquota4)
    )
      .get()
      .toPromise()
      .then((snapshot) => {
        if (!snapshot) {
          return false;
        }
        return !snapshot.empty;
      })
      .catch((error) => {
        console.error('Erro ao verificar duplicidade', error);
        throw error;
      });
  }






}
