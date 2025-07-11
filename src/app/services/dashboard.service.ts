import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private firestore: AngularFirestore) { }

  getSimulacoesProdutosFinalizadas() {
    return this.firestore.collection('cabecalhoProdutos', ref => ref.where('finalizado', '==', 'Sim'))
      .snapshotChanges()
      .pipe(
        map(actions => {
          const meses = Array(12).fill(0); // Array para contar simulações por mês
          actions.forEach(a => {
            const data = a.payload.doc.data() as any;
            const dataCriacao = new Date(data.dataCriacao); // Converte dataCriacao para Date
            const mes = dataCriacao.getMonth(); // Extrai o mês (0 = janeiro, 11 = dezembro)
            meses[mes]++;
          });
          return meses; // Retorna o array de simulações por mês
        })
      );
  }

  getSimulacoesServicosFinalizadas() {
    return this.firestore.collection('cabecalhoServico', ref => ref.where('finalizado', '==', 'Sim'))
      .snapshotChanges()
      .pipe(
        map(actions => {
          const meses = Array(12).fill(0); // Array para contar simulações por mês
          actions.forEach(a => {
            const data = a.payload.doc.data() as any;
            const dataCriacao = new Date(data.dataCriacao); // Converte dataCriacao para Date
            const mes = dataCriacao.getMonth(); // Extrai o mês (0 = janeiro, 11 = dezembro)
            meses[mes]++;
          });
          return meses; // Retorna o array de simulações por mês
        })
      );
  }

  getLucroProdutosPorMes() {
    return this.firestore.collection('cabecalhoProdutos', ref => ref.where('finalizado', '==', 'Sim'))
      .snapshotChanges()
      .pipe(
        map(actions => {
          const meses = Array(12).fill({ lucro: 0, valorTotalVenda: 0 }); // Array para armazenar lucro e valorTotalVenda por mês

          actions.forEach(a => {
            const data = a.payload.doc.data() as any;
            const dataCriacao = new Date(data.dataCriacao); // Converte dataCriacao para Date
            const mes = dataCriacao.getMonth(); // Extrai o mês (0 = janeiro, 11 = dezembro)

            // Atualiza o lucro e o valorTotalVenda para o mês correspondente
            meses[mes] = {
              lucro: meses[mes].lucro + data.totalLucroReais,
              valorTotalVenda: meses[mes].valorTotalVenda + data.valorTotalVenda
            };
          });

          return meses; // Retorna o array de objetos com lucro e valorTotalVenda por mês
        })
      );
  }
  getLucroServicosPorMes() {
    return this.firestore.collection('cabecalhoServico', ref => ref.where('finalizado', '==', 'Sim'))
      .snapshotChanges()
      .pipe(
        map(actions => {
          const meses = Array(12).fill({ lucro: 0, totalServicoComDesconto: 0 }); // Array para armazenar lucro e totalServicoComDesconto por mês

          actions.forEach(a => {
            const data = a.payload.doc.data() as any;
            const dataCriacao = new Date(data.dataCriacao); // Converte dataCriacao para Date
            const mes = dataCriacao.getMonth(); // Extrai o mês (0 = janeiro, 11 = dezembro)

            // Atualiza o lucro e o totalServicoComDesconto para o mês correspondente
            meses[mes] = {
              lucro: meses[mes].lucro + data.totalLucroReais,
              totalServicoComDesconto: meses[mes].totalServicoComDesconto + data.totalServicoComDesconto
            };
          });

          return meses; // Retorna o array de objetos com lucro e totalServicoComDesconto por mês
        })
      );
  }

}