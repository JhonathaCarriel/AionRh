import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class ListaNcmService {
  private ncmList = [
    { uf:'RO', ncm: '73182900', cest: '0199900', percentualCofins:'0.00', percentualPis:'0.00', mva: '0.00', mva4: '0.00', mva7: '0.00',  mva12: '0.00', aliquotaInterna: '0.00', irpj: '1.20', csll: '1.08' },
    { uf:'RO', ncm: '40169300', cest: '0100700', percentualCofins:'3.00', percentualPis:'0.65', mva: '55.96',mva4: '0.00', mva7: '0.00',  mva12: '0.00',  aliquotaInterna: '19.50', irpj: '1.20', csll: '1.08' },
    { uf:'RO', ncm: '84314929', cest: '0104500', percentualCofins:'0.00', percentualPis:'0.00', mva: '55.96',mva4: '0.00', mva7: '0.00',  mva12: '0.00',  aliquotaInterna: '19.50', irpj: '1.20', csll: '1.08' },
    { uf:'RO', ncm: '73182900', cest: '0199900', percentualCofins:'0.00', percentualPis:'0.00', mva: '0.00',mva4: '0.00', mva7: '0.00',  mva12: '0.00',  aliquotaInterna: '0.00', irpj: '1.20', csll: '1.08' },
    { uf:'RO', ncm: '73182100', cest: '0199900', percentualCofins:'0.00', percentualPis:'0.00', mva: '0.00', mva4: '0.00', mva7: '0.00',  mva12: '0.00', aliquotaInterna: '0.00', irpj: '1.20', csll: '1.08' },
    { uf:'RO', ncm: '84839000', cest: '0105000', percentualCofins:'3.00', percentualPis:'0.65', mva: '60.99',mva4: '0.00', mva7: '0.00',  mva12: '0.00',  aliquotaInterna: '19.50', irpj: '1.20', csll: '1.08' },
    { uf:'RO', ncm: '87085099', cest: '0107500', percentualCofins:'3.00', percentualPis:'0.65', mva: '55.96',mva4: '0.00', mva7: '0.00',  mva12: '0.00',  aliquotaInterna: '19.50', irpj: '1.20', csll: '1.08' },
    { uf:'RO', ncm: '87089990', cest: '0107500', percentualCofins:'3.00', percentualPis:'0.65', mva: '55.96', mva4: '0.00', mva7: '0.00',  mva12: '0.00', aliquotaInterna: '19.50', irpj: '1.20', csll: '1.08' },
    { uf:'RO', ncm: '84139190', cest: '0103500', percentualCofins:'3.00', percentualPis:'0.65', mva: '60.99',mva4: '0.00', mva7: '0.00',  mva12: '0.00',  aliquotaInterna: '19.50', irpj: '1.20', csll: '1.08' },
    { uf:'RO', ncm: '84136011', cest: '0199900', percentualCofins:'0.00', percentualPis:'0.00', mva: '0.00', mva4: '0.00', mva7: '0.00',  mva12: '0.00', aliquotaInterna: '0.00', irpj: '1.20', csll: '1.08' },
    { uf:'RO', ncm: '84212300', cest: '0103700', percentualCofins:'0.00', percentualPis:'0.00', mva: '60.99',mva4: '0.00', mva7: '0.00',  mva12: '0.00',  aliquotaInterna: '19.50', irpj: '1.20', csll: '1.08' }
  ];

  constructor(
    private firestore: AngularFirestore
  ) {}

  // Obter MVA de um NCM específico
  getMVA(ncm: string, cest: string): number {
    const ncmItem = this.ncmList.find(item => item.ncm === ncm && item.cest === cest);
    return ncmItem ? parseFloat(ncmItem.mva.replace('', '')) : 0;
  }
  getNcmList() {
    return this.ncmList;
  }

  addNcm(ncm: any) {
    this.ncmList.push(ncm);
  }

  updateNcm(ncmToEdit: string, cestToEdit: string, updatedNcm: any) {
    const index = this.ncmList.findIndex(ncm => ncm.ncm === ncmToEdit && ncm.cest === cestToEdit);
    if (index !== -1) {
      this.ncmList[index] = updatedNcm;
    }
  }

  deleteNcm(ncm: string, cest: string) {
    const index = this.ncmList.findIndex(n => n.ncm === ncm && n.cest === cest);
    if (index !== -1) {
      this.ncmList.splice(index, 1);
    }
  }

  getNcmData(ncm: string, cest: string, uf: string): Promise<any> {
    return this.firestore
      .collection('ncm')
      .ref.where('ncm', '==', ncm)
      .where('cest', '==', cest)
      .where('uf', '==', uf)
      .get()
      .then(snapshot => {
        if (!snapshot.empty) {
          return snapshot.docs[0].data(); 
        }
        return null; 
      });
  }
  

  
}