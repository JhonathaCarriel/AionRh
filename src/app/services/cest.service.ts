import { Injectable } from '@angular/core';
import cestData from 'src/assets/cest.json'; // Caminho para o arquivo JSON

@Injectable({
  providedIn: 'root',
})
export class CestService {
  constructor() {}

  // Busca CESTs por prefixo ou NCM completo
  buscarCestsPorPrefixoNcm(ncm: string): string[] {
    const sanitizedNcm = ncm.trim(); // Remove espaços desnecessários
    return cestData
      .filter((item) => {
        const sanitizedItemNcm = item.ncm.replace(/\s+/g, ''); // Remove espaços do NCM no JSON
        return sanitizedNcm.startsWith(sanitizedItemNcm); // Verifica se o NCM informado começa com o NCM do JSON
      })
      .map((item) => item.cest); // Retorna os CESTs encontrados
  }
}
