import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import ncmData from 'src/assets/ncm.json';

@Injectable({
  providedIn: 'root'
})
export class NcmService {

  constructor(
    public firestore: AngularFirestore,
  ) { }

  buscarDescricaoPorNcm(ncm: string): string | undefined {
    const sanitizedNcm = ncm.trim(); // Remove espaços desnecessários
    const result = ncmData.find((item) => item.ncm === sanitizedNcm);
    return result ? result.descricao : undefined; // Retorna a descrição ou undefined
  }

  getAllNcmData() {
    return ncmData; 
  }
  checkNcmExists(ncm: string, uf: string, cest: string): Observable<boolean> {
    return this.firestore
      .collection('ncm', ref =>
        ref
          .where('ncm', '==', ncm)         
          .where('uf', '==', uf)
      )
      .get()
      .pipe(
        map(snapshot => {
          const exists = !snapshot.empty;      
          return exists; 
        })
      );
  }
  
  getNcmData(ncm: string, uf: string): Observable<any> {
    return this.firestore.collection('ncm', ref =>
      ref
        .where('ncm', '==', ncm)
        .where('uf', '==', uf)
    ).valueChanges().pipe(
      map((data: any[]) => {
        if (data.length > 0) {
          // Extraindo os campos necessários do primeiro documento
          const ncmData = data[0];
          return {
            mvaOriginal: ncmData.mvaOriginal,
            mvaAliquota12: ncmData.mvaAliquota12,
            mvaAliquota7: ncmData.mvaAliquota7,
            mvaAliquota4: ncmData.mvaAliquota4,
            cst: ncmData.cst

          };
        }
        return null; 
      })
    );
  }
  


}
