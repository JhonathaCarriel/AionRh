import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BuscarNcmService {
  constructor(private firestore: AngularFirestore) {}

  buscarNCMDataDistribuidor(ncm: string, cest: string,  ufDistribuidor: string): Observable<any> {
    return this.firestore
      .collection('ncm', (ref) =>
        ref.where('ncm', '==', ncm).where('uf', '==', ufDistribuidor).where('cest', '==', cest)
      )
      .valueChanges();
  }

  buscarNCMDataVarejista(ncm: string, ufVarejista: string): Observable<any> {
    return this.firestore
      .collection('ncm', (ref) =>
        ref.where('ncm', '==', ncm).where('uf', '==', ufVarejista)
      )
      .valueChanges();
  }

  buscarCESTsPorNCM(ncm: string): Observable<any[]> {
    return this.firestore
      .collection('ncm', (ref) => ref.where('ncm', '==', ncm))
      .valueChanges();
  }
}
