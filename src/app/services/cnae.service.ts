import { Injectable } from '@angular/core';
import cnaeData from 'src/assets/cnae.json';

@Injectable({
  providedIn: 'root'
})
export class CnaeService {

  constructor() { }

  buscarDescricaoPorCnae(cnae: string): string | undefined {
    const sanitizedNcm = cnae.trim(); // Remove espaços desnecessários
    const result = cnaeData.find((item) => item.cnae === sanitizedNcm);
    return result ? result.descricao : undefined; // Retorna a descrição ou undefined
  }
}
