import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';

export interface EstadoAliquota{
  aliquotaICMSATNormalMaior3200:number;
  aliquotaICMSATNormalMaior2500:  number;
  aliquotaICMSATNormalMaior1950: number;
  aliquotaICMSATNormalIgual1950: number;
  aliquotaICMSATNormalIgual1200: number;
  aliquotaICMSATImportadoMaior3200: number;
  aliquotaICMSATImportadoMaior2500:number;
  aliquotaICMSATImportadoMaior1950: number;
  aliquotaICMSATImportadoIgual1950: number;
  aliquotaICMSATImportadoIgual1200: number;
  sigla: string;
  nome: string;
  aliquotaInterna: number;
  aliquotaInterestadual: number;
  importado: number;
}

@Injectable({
  providedIn: 'root'
})
export class AliquotasService {
  private estados: Map<string, EstadoAliquota> = new Map([
    ['AC', { sigla: 'AC', importado: 4, nome: 'Acre', aliquotaInterna: 19, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['AL', { sigla: 'AL', importado: 4, nome: 'Alagoas', aliquotaInterna: 19, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['AP', { sigla: 'AP', importado: 4, nome: 'Amapá', aliquotaInterna: 18, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['AM', { sigla: 'AM', importado: 4, nome: 'Amazonas', aliquotaInterna: 20, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['BA', { sigla: 'BA', importado: 4, nome: 'Bahia', aliquotaInterna: 20.5, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['CE', { sigla: 'CE', importado: 4, nome: 'Ceará', aliquotaInterna: 20, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['DF', { sigla: 'DF', importado: 4, nome: 'Distrito Federal', aliquotaInterna: 20, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['ES', { sigla: 'ES', importado: 4, nome: 'Espírito Santo', aliquotaInterna: 17, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['GO', { sigla: 'GO', importado: 4, nome: 'Goiás', aliquotaInterna: 19, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['MA', { sigla: 'MA', importado: 4, nome: 'Maranhão', aliquotaInterna: 22, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['MG', { sigla: 'MG', importado: 4, nome: 'Minas Gerais', aliquotaInterna: 18, aliquotaInterestadual: 7, aliquotaICMSATNormalIgual1200: 8, aliquotaICMSATNormalIgual1950: 14, aliquotaICMSATNormalMaior1950: 23, aliquotaICMSATNormalMaior2500: 29, aliquotaICMSATNormalMaior3200: 35, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['MS', { sigla: 'MS', importado: 4, nome: 'Mato Grosso do Sul', aliquotaInterna: 17, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['MT', { sigla: 'MT', importado: 4, nome: 'Mato Grosso', aliquotaInterna: 17, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['PA', { sigla: 'PA', importado: 4, nome: 'Pará', aliquotaInterna: 19, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['PB', { sigla: 'PB', importado: 4, nome: 'Paraíba', aliquotaInterna: 20, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['PE', { sigla: 'PE', importado: 4, nome: 'Pernambuco', aliquotaInterna: 20.5, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['PI', { sigla: 'PI', importado: 4, nome: 'Piauí', aliquotaInterna: 21, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['PR', { sigla: 'PR', importado: 4, nome: 'Paraná', aliquotaInterna: 19.5, aliquotaInterestadual: 7, aliquotaICMSATNormalIgual1200: 8, aliquotaICMSATNormalIgual1950: 14, aliquotaICMSATNormalMaior1950: 23, aliquotaICMSATNormalMaior2500: 29, aliquotaICMSATNormalMaior3200: 35, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['RJ', { sigla: 'RJ', importado: 4, nome: 'Rio de Janeiro', aliquotaInterna: 20, aliquotaInterestadual: 7, aliquotaICMSATNormalIgual1200: 8, aliquotaICMSATNormalIgual1950: 14, aliquotaICMSATNormalMaior1950: 23, aliquotaICMSATNormalMaior2500: 29, aliquotaICMSATNormalMaior3200: 35, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['RN', { sigla: 'RN', importado: 4, nome: 'Rio Grande do Norte', aliquotaInterna: 18, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['RS', { sigla: 'RS', importado: 4, nome: 'Rio Grande do Sul', aliquotaInterna: 17, aliquotaInterestadual: 7, aliquotaICMSATNormalIgual1200: 8, aliquotaICMSATNormalIgual1950: 14, aliquotaICMSATNormalMaior1950: 23, aliquotaICMSATNormalMaior2500: 29, aliquotaICMSATNormalMaior3200: 35, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['RO', { sigla: 'RO', importado: 4, nome: 'Rondônia', aliquotaInterna: 19.5, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['RR', { sigla: 'RR', importado: 4, nome: 'Roraima', aliquotaInterna: 20, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['SC', { sigla: 'SC', importado: 4, nome: 'Santa Catarina', aliquotaInterna: 17, aliquotaInterestadual: 7, aliquotaICMSATNormalIgual1200: 8, aliquotaICMSATNormalIgual1950: 14, aliquotaICMSATNormalMaior1950: 23, aliquotaICMSATNormalMaior2500: 29, aliquotaICMSATNormalMaior3200: 35, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['SE', { sigla: 'SE', importado: 4, nome: 'Sergipe', aliquotaInterna: 19, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['SP', { sigla: 'SP', importado: 4, nome: 'São Paulo', aliquotaInterna: 18, aliquotaInterestadual: 7, aliquotaICMSATNormalIgual1200: 8, aliquotaICMSATNormalIgual1950: 14, aliquotaICMSATNormalMaior1950: 23, aliquotaICMSATNormalMaior2500: 29, aliquotaICMSATNormalMaior3200: 35, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
    ['TO', { sigla: 'TO', importado: 4, nome: 'Tocantins', aliquotaInterna: 20, aliquotaInterestadual: 12, aliquotaICMSATNormalIgual1200: 3, aliquotaICMSATNormalIgual1950: 9, aliquotaICMSATNormalMaior1950: 18, aliquotaICMSATNormalMaior2500: 24, aliquotaICMSATNormalMaior3200: 30, aliquotaICMSATImportadoIgual1200: 11, aliquotaICMSATImportadoIgual1950: 17, aliquotaICMSATImportadoMaior1950: 26, aliquotaICMSATImportadoMaior2500: 32, aliquotaICMSATImportadoMaior3200: 38 }],
]);
  getAliquotaInterestadual(uf: string): Observable<number | undefined> {
    const estado = this.estados.get(uf);
    if (estado) {
      return new Observable(observer => {
        observer.next(estado.aliquotaInterestadual);
        observer.complete();
      });
    } else {
      return new Observable(observer => {
        observer.error(`Estado não encontrado: ${uf}`);
        observer.complete();
      });
    }
  }

  getAliquotaInterna(uf: string): Observable<number | undefined> {
    const estado = this.estados.get(uf);
    if (estado) {
      return new Observable(observer => {
        observer.next(estado.aliquotaInterna);
        observer.complete();
      });
    } else {
      return new Observable(observer => {
        observer.error(`Estado não encontrado: ${uf}`);
        observer.complete();
      });
    }
  }

  getAliquota(estadoSigla: string): EstadoAliquota | undefined {
    return this.estados.get(estadoSigla);
  }


  getAllEstados(): EstadoAliquota[] {
    return Array.from(this.estados.values());
  }

  constructor(
    public firestore: AngularFirestore,
  ) {}

getAliquotaInternaFornecedor(ufFornecedor: string): number {

    const estadoFornecedor = this.estados.get(ufFornecedor);
    return estadoFornecedor ? estadoFornecedor.aliquotaInterna : 0;
}

  getAliquotaInterestadualFornecedor(ufFornecedor: string): number {
    const estadoFornecedor = this.estados.get(ufFornecedor);
      return estadoFornecedor ? estadoFornecedor.aliquotaInterestadual : 0;

  }
  getAliquotaInterestadualFornecedorImportado(ufFornecedor: string): number {
    const estadoFornecedor = this.estados.get(ufFornecedor);
      return estadoFornecedor ? estadoFornecedor.importado : 0;
  }

  getAliquotaInterestadualDistribuidor(ufDistribuidor: string): number {
    const estadoDistribuidor = this.estados.get(ufDistribuidor);
    return estadoDistribuidor ? estadoDistribuidor.aliquotaInterestadual : 0;
  }


  getAliquotaInternaDistribuidor(ufDistribuidor: string): number {
    const estadoDistribuidor = this.estados.get(ufDistribuidor);

    return estadoDistribuidor ? estadoDistribuidor.aliquotaInterna : 0;
  }

  getAliquotaInternaVarejista(ufVarejista: string): number {
    const estadoVarejista = this.estados.get(ufVarejista);

    return estadoVarejista ? estadoVarejista.aliquotaInterna : 0;
  }
  getAliquotaInterestadualVarejista(ufVarejista: string): number {
    const estadoVarejista = this.estados.get(ufVarejista);

    return estadoVarejista ? estadoVarejista.aliquotaInterestadual : 0;
  }

  getAliquotaICMSATDistribuidor(
    ufFornecedor: string,
    dadosDistribuidoraliquotaicms: string,
    produtoImportado: string,
    aliquotaInternaDistribuidor: number
  ): number {
    const estadoFornecedor = this.estados.get(ufFornecedor);

    if (!estadoFornecedor) {
      throw new Error(`Estado do fornecedor não encontrado: ${ufFornecedor}`);
    }

    if (['FF', 'II', 'NN'].includes(dadosDistribuidoraliquotaicms)) {
      return 0;
    }



    // Verifica se o produto é importado
    const isProdutoImportado = produtoImportado === 'Sim';

    // Define as alíquotas de ICMS/ST com base no tipo de produto (importado ou não)
    const aliquotaICMSAT = isProdutoImportado
      ? {
          igual12: estadoFornecedor.aliquotaICMSATImportadoIgual1200,
          igual1950: estadoFornecedor.aliquotaICMSATImportadoIgual1950,
          maior1950: estadoFornecedor.aliquotaICMSATImportadoMaior1950,
          maior2500: estadoFornecedor.aliquotaICMSATImportadoMaior2500,
          maior3200: estadoFornecedor.aliquotaICMSATImportadoMaior3200,
        }
      : {
          igual12: estadoFornecedor.aliquotaICMSATNormalIgual1200,
          igual1950: estadoFornecedor.aliquotaICMSATNormalIgual1950,
          maior1950: estadoFornecedor.aliquotaICMSATNormalMaior1950,
          maior2500: estadoFornecedor.aliquotaICMSATNormalMaior2500,
          maior3200: estadoFornecedor.aliquotaICMSATNormalMaior3200,
        };

    // Converte a string para número para comparação
    const aliquotaICMS = parseFloat(dadosDistribuidoraliquotaicms);
    const aliquotaInterna = aliquotaInternaDistribuidor;

    // Verifica a alíquota de ICMS/ST com base no valor de dadosDistribuidoraliquotaicms
    if (aliquotaICMS === 12) {
      return aliquotaICMSAT.igual12;
    } else if (aliquotaICMS === aliquotaInterna) {
      return aliquotaICMSAT.igual1950;
    } else if (aliquotaICMS > aliquotaInterna && aliquotaICMS <= 25) {
      return aliquotaICMSAT.maior1950;
    } else if (aliquotaICMS > 25 && aliquotaICMS <= 32) {
      return aliquotaICMSAT.maior2500;
    } else if (aliquotaICMS > 32) {
      return aliquotaICMSAT.maior3200;
    } else {
      throw new Error(`Valor de dadosDistribuidoraliquotaicms inválido: ${dadosDistribuidoraliquotaicms}`);
    }
  }

  getAliquotaICMSATVarejista(
    ufDistribuidor: string,
    dadosVarejistaaliquotaicms: string,
    produtoImportado: string,
    aliquotaInternaVarejista: number,
  ): number {
    // If product is imported, return 4 immediately
    if (produtoImportado === 'Sim') {
      return 4;
    }

    const estadoFornecedor = this.estados.get(ufDistribuidor);

    if (!estadoFornecedor) {
      throw new Error(`Estado do fornecedor não encontrado: ${ufDistribuidor}`);
    }

    if (['FF', 'II', 'NN'].includes(dadosVarejistaaliquotaicms)) {
      return 0;
    }

    // Get normal aliquots (since we already handled imported case)
    const aliquotaICMSAT = {
      igual12: estadoFornecedor.aliquotaICMSATNormalIgual1200,
      igual1950: estadoFornecedor.aliquotaICMSATNormalIgual1950,
      maior1950: estadoFornecedor.aliquotaICMSATNormalMaior1950,
      maior2500: estadoFornecedor.aliquotaICMSATNormalMaior2500,
      maior3200: estadoFornecedor.aliquotaICMSATNormalMaior3200,
    };

    // Convert string to number for comparison
    const aliquotaICMS = parseFloat(dadosVarejistaaliquotaicms);
    const aliquotaInterna = aliquotaInternaVarejista;

    // Check ICMS/ST aliquot based on dadosVarejistaaliquotaicms value
    if (aliquotaICMS === 12) {
      return aliquotaICMSAT.igual12;
    } else if (aliquotaICMS === aliquotaInterna) {
      return aliquotaICMSAT.igual1950;
    } else if (aliquotaICMS > aliquotaInterna && aliquotaICMS <= 25) {
      return aliquotaICMSAT.maior1950;
    } else if (aliquotaICMS > 25 && aliquotaICMS <= 32) {
      return aliquotaICMSAT.maior2500;
    } else if (aliquotaICMS > 32) {
      return aliquotaICMSAT.maior3200;
    } else {
      throw new Error(`Valor de dadosVarejistaaliquotaicms inválido: ${dadosVarejistaaliquotaicms}`);
    }
  }

  getAliquotaInternaCliente(ufCliente: string): number {
    const estadoCliente = this.estados.get(ufCliente);
    return estadoCliente ? estadoCliente.aliquotaInterna : 0;
  }

  //Listas
   // Lista de atividades
   atividades = [
    { nome: 'Atacadista' },
    { nome: 'Distribuidor' },
    { nome: 'Fabricante' },
    { nome: 'Varejista' },
    { nome: 'Indústria' },
    { nome: 'Consumidor Final' },
  ];
  tiposEmpresas = [
    { nome: 'Fornecedor' },
    { nome: 'Matriz' },
    { nome: 'Filial' },
    { nome: 'Clientes' },
    { nome: 'Outros' },
  ];

  // Lista de booleanos
  boleanos = [
    { nome: 'Sim', value: 'Sim' },
    { nome: 'Não', value: 'Nao' },
  ];


}
