import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CstService {
  cstPisCofinsEntrada = [
    { value: '50', description: '50 - Operação com Direito a Crédito - Vinculada Exclusivamente a Receita Tributada no Mercado Interno' },
    { value: '51', description: '51 - Operação com Direito a Crédito – Vinculada Exclusivamente a Receita Não Tributada no Mercado Interno' },
    { value: '52', description: '52 - Operação com Direito a Crédito – Vinculada Exclusivamente a Receita de Exportação' },
    { value: '53', description: '53 - Operação com Direito a Crédito – Vinculada a Receitas Tributadas e Não Tributadas no Mercado Interno' },
    { value: '54', description: '54 - Operação com Direito a Crédito – Vinculada a Receitas Tributadas no Mercado Interno e de Exportação' },
    { value: '55', description: '55 - Operação com Direito a Crédito – Vinculada a Receitas Não Tributadas no Mercado Interno e de Exportação' },
    { value: '56', description: '56 - Operação com Direito a Crédito – Vinculada a Receitas Tributadas e Não Tributadas no Mercado Interno e de Exportação' },
    { value: '60', description: '60 - Crédito Presumido – Operação de Aquisição Vinculada Exclusivamente a Receita Tributada no Mercado Interno' },
    { value: '61', description: '61 - Crédito Presumido – Operação de Aquisição Vinculada Exclusivamente a Receita Não Tributada no Mercado Interno' },
    { value: '62', description: '62 - Crédito Presumido – Operação de Aquisição Vinculada Exclusivamente a Receita de Exportação' },
    { value: '63', description: '63 - Crédito Presumido – Operação de Aquisição Vinculada a Receitas Tributadas e Não Tributadas no Mercado Interno' },
    { value: '64', description: '64 - Crédito Presumido – Operação de Aquisição Vinculada a Receitas Tributadas no Mercado Interno e de Exportação' },
    { value: '65', description: '65 - Crédito Presumido – Operação de Aquisição Vinculada a Receitas Não Tributadas no Mercado Interno e de Exportação' },
    { value: '66', description: '66 - Crédito Presumido – Operação de Aquisição Vinculada a Receitas Tributadas e Não Tributadas no Mercado Interno e de Exportação' },
    { value: '67', description: '67 - Crédito Presumido – Outras Operações' },
    { value: '70', description: '70 - Operação de Aquisição sem Direito a Crédito' },
    { value: '71', description: '71 - Operação de Aquisição com Isenção' },
    { value: '72', description: '72 - Operação de Aquisição com Suspensão' },
    { value: '73', description: '73 - Operação de Aquisição a Alíquota Zero' },
    { value: '74', description: '74 - Operação de Aquisição sem Incidência da Contribuição' },
    { value: '75', description: '75 - Operação de Aquisição por Substituição Tributária' },
    { value: '98', description: '98 - Outras Operações de Entrada' },
    { value: '99', description: '99 - Outras Operações' }
  ];

  cstPisCofinsSaida = [
    { value: '01', description: '01 - Operação Tributável com Alíquota Básica' },
    { value: '02', description: '02 - Operação Tributável com Alíquota Diferenciada' },
    { value: '03', description: '03 - Operação Tributável com Alíquota por Unidade de Medida de Produto' },
    { value: '04', description: '04 - Operação Tributável Monofásica - Revenda a Alíquota Zero' },
    { value: '05', description: '05 - Operação Tributável por Substituição Tributária' },
    { value: '06', description: '06 - Operação Tributável a Alíquota Zero' },
    { value: '07', description: '07 - Operação Isenta da Contribuição' },
    { value: '08', description: '08 - Operação sem Incidência da Contribuição' },
    { value: '09', description: '09 - Operação com Suspensão da Contribuição' },
    { value: '49', description: '49 - Outras Operações de Saída' }
  ];

  cstIpi = [
    { value: '00', description: '00 - Entrada com recuperação de crédito' },
    { value: '01', description: '01 - Entrada tributada com alíquota zero' },
    { value: '02', description: '02 - Entrada isenta' },
    { value: '03', description: '03 - Entrada não-tributada' },
    { value: '04', description: '04 - Entrada imune' },
    { value: '05', description: '05 - Entrada com suspensão' },
    { value: '49', description: '49 - Outras entradas' },
    { value: '50', description: '50 - Saída tributada' },
    { value: '51', description: '51 - Saída tributada com alíquota zero' },
    { value: '52', description: '52 - Saída isenta' },
    { value: '53', description: '53 - Saída não-tributada' },
    { value: '54', description: '54 - Saída imune' },
    { value: '55', description: '55 - Saída com suspensão' },
    { value: '99', description: '99 - Outras saídas' }
  ];

  cst = [
    { value: '00', description: '00 - Tributada integralmente' },
    { value: '10', description: '10 - Tributada e com cobrança do ICMS por substituição tributária' },
    { value: '20', description: '20 - Com redução de base de cálculo' },
    { value: '30', description: '30 - Isenta ou não tributada e com cobrança do ICMS por substituição tributária' },
    { value: '40', description: '40 - Isenta' },
    { value: '41', description: '41 - Não tributada' },
    { value: '50', description: '50 - Suspensão' },
    { value: '51', description: '51 - Diferimento' },
    { value: '60', description: '60 - ICMS cobrado anteriormente por substituição tributária' },
    { value: '70', description: '70 - Com redução de base de cálculo e cobrança do ICMS por substituição tributária' },
    { value: '90', description: '90 - Outras' }
  ];

  constructor() { }
}
