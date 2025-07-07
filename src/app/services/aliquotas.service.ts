import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';

export interface EstadoAliquota{
  sigla: string;
  nome: string;
  aliquotaInterna: number;
  aliquotaInterestadual: number;
}

@Injectable({
  providedIn: 'root'
})
export class AliquotasService {
  private estados: Map<string, EstadoAliquota> = new Map([
    ['AC', { sigla: 'AC', nome: 'Acre', aliquotaInterna: 19, aliquotaInterestadual: 12 }],
    ['AL', { sigla: 'AL', nome: 'Alagoas', aliquotaInterna: 19, aliquotaInterestadual: 12 }],
    ['AP', { sigla: 'AP', nome: 'Amapá', aliquotaInterna: 18, aliquotaInterestadual: 12 }],
    ['AM', { sigla: 'AM', nome: 'Amazonas', aliquotaInterna: 20, aliquotaInterestadual: 12 }],
    ['BA', { sigla: 'BA', nome: 'Bahia', aliquotaInterna: 20.5, aliquotaInterestadual: 12 }],
    ['CE', { sigla: 'CE', nome: 'Ceará', aliquotaInterna: 20, aliquotaInterestadual: 12 }],
    ['DF', { sigla: 'DF', nome: 'Distrito Federal', aliquotaInterna: 20, aliquotaInterestadual: 12 }],
    ['ES', { sigla: 'ES', nome: 'Espírito Santo', aliquotaInterna: 17, aliquotaInterestadual: 12 }],
    ['GO', { sigla: 'GO', nome: 'Goiás', aliquotaInterna: 19, aliquotaInterestadual: 12 }],
    ['MA', { sigla: 'MA', nome: 'Maranhão', aliquotaInterna: 22, aliquotaInterestadual: 12 }],
    ['MG', { sigla: 'MG', nome: 'Minas Gerais', aliquotaInterna: 18, aliquotaInterestadual: 7 }],
    ['MS', { sigla: 'MS', nome: 'Mato Grosso do Sul', aliquotaInterna: 17, aliquotaInterestadual: 12 }],
    ['MT', { sigla: 'MT', nome: 'Mato Grosso', aliquotaInterna: 17, aliquotaInterestadual: 12 }],
    ['PA', { sigla: 'PA', nome: 'Pará', aliquotaInterna: 19, aliquotaInterestadual: 12 }],
    ['PB', { sigla: 'PB', nome: 'Paraíba', aliquotaInterna: 20, aliquotaInterestadual: 12 }],
    ['PE', { sigla: 'PE', nome: 'Pernambuco', aliquotaInterna: 20.5, aliquotaInterestadual: 12 }],
    ['PI', { sigla: 'PI', nome: 'Piauí', aliquotaInterna: 21, aliquotaInterestadual: 12 }],
    ['PR', { sigla: 'PR', nome: 'Paraná', aliquotaInterna: 19.5, aliquotaInterestadual: 7 }],
    ['RJ', { sigla: 'RJ', nome: 'Rio de Janeiro', aliquotaInterna: 20, aliquotaInterestadual: 7 }],
    ['RN', { sigla: 'RN', nome: 'Rio Grande do Norte', aliquotaInterna: 18, aliquotaInterestadual: 12 }],
    ['RS', { sigla: 'RS', nome: 'Rio Grande do Sul', aliquotaInterna: 17, aliquotaInterestadual: 7 }],
    ['RO', { sigla: 'RO', nome: 'Rondônia', aliquotaInterna: 19.5, aliquotaInterestadual: 12 }],
    ['RR', { sigla: 'RR', nome: 'Roraima', aliquotaInterna: 20, aliquotaInterestadual: 12 }],
    ['SC', { sigla: 'SC', nome: 'Santa Catarina', aliquotaInterna: 17, aliquotaInterestadual: 7 }],
    ['SE', { sigla: 'SE', nome: 'Sergipe', aliquotaInterna: 19, aliquotaInterestadual: 12 }],
    ['SP', { sigla: 'SP', nome: 'São Paulo', aliquotaInterna: 18, aliquotaInterestadual: 7 }],
    ['TO', { sigla: 'TO', nome: 'Tocantins', aliquotaInterna: 20, aliquotaInterestadual: 12 }],
  ]);


  getAliquota(estadoSigla: string): EstadoAliquota | undefined {
    return this.estados.get(estadoSigla);
  }


  getAllEstados(): EstadoAliquota[] {
    return Array.from(this.estados.values());
  }

  constructor(
    public firestore: AngularFirestore,
  ) {}

  getAliquotaInterestadual(ufFornecedor: string, ufDestino: string): number | undefined {

    if (ufFornecedor === ufDestino) {
      return 0; 
    }   

    const estadoDestino = this.estados.get(ufDestino);
    return estadoDestino ? estadoDestino.aliquotaInterestadual : undefined;
  }

  getAliquotaInterestadualFornecedor(ufFornecedor: string, ufDistribuidor: string): number {
    const estadoFornecedor = this.estados.get(ufFornecedor);

    if (ufFornecedor === ufDistribuidor) {

      return estadoFornecedor ? estadoFornecedor.aliquotaInterna: 0;
    } 
      return estadoFornecedor ? estadoFornecedor.aliquotaInterestadual : 0;
 
  }

  getAliquotaInternaDistribuidor(ufDistribuidor: string): number {
    const estadoDistribuidor = this.estados.get(ufDistribuidor);

    return estadoDistribuidor ? estadoDistribuidor.aliquotaInterna : 0; 
  }
  
  
}