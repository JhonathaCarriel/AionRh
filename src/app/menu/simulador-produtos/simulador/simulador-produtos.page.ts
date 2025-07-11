
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';


@Component({
  selector: 'app-simulador-produtos',
  templateUrl: './simulador-produtos.page.html',
  styleUrls: ['./simulador-produtos.page.scss'],
})
export class SimuladorProdutosPage implements OnInit {

  pageTitle: string = 'Simulação de Produtos'
  TitleSubheader: string = ''
  searchTerm: string = ''
  cabecalhos: any[] = [];


  constructor(
    public firestore: AngularFirestore,
    public router: Router,
    public toastController: ToastController,
  ) { }

  ngOnInit() {
    this.carregarCabecalhos();
  }

  carregarCabecalhos() {
    this.firestore.collection('cabecalhoProdutos', ref =>
      ref.where('situacao', '==', 'Ativa')
         .orderBy('dataCriacao', 'desc')  // Ordena pela dataCriacao em ordem decrescente
    )
    .valueChanges({ idField: 'id' })
    .subscribe((dados: any[]) => {
      this.cabecalhos = dados;
    }, error => {
      console.error('Erro ao carregar cabeçalhos:', error);
    });
  }


  async excluirCabecalho(id: string) {
    try {
      // Atualizar a situação do cabeçalho para "Cancelada"
      await this.firestore.collection('cabecalhoProdutos').doc(id).update({
        situacao: 'Cancelada'
      });

      // Buscar os serviçosSimulados vinculados ao cabeçalho
      const servicosRef = this.firestore.collection('produtosSimulados', ref =>
        ref.where('cabecalhoId', '==', id)
      );

      servicosRef.get().subscribe(snapshot => {
        snapshot.forEach(doc => {
          doc.ref.update({ situacao: 'Cancelada' });
        });
      });

      // Exibir mensagem de sucesso
      const toast = await this.toastController.create({
        message: 'Simulação removida com sucesso!',
        duration: 1000,
        color: 'success',
      });
      toast.present();

    } catch (error) {
      console.error('Erro ao cancelar cabeçalho:', error);
      const toast = await this.toastController.create({
        message: 'Erro ao cancelar cabeçalho!',
        duration: 2000,
        color: 'danger',
      });
      toast.present();
    }
  }

  editarCabecalho(id: string) {
   this.router.navigate([`/simulador/produtos/editar/${id}`]);
  }
  onSearchChange() {
    this.filterItems();
  }

  onSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.filterItems();
  }

  filterItems() {
    if (this.searchTerm.trim() === '') {
      this.carregarCabecalhos();
    } else {
      const term = this.searchTerm.toLowerCase();
      const searchDate = this.convertToDate(this.searchTerm);

      this.cabecalhos = this.cabecalhos.filter(item => {
        const itemDate = this.convertToDate(item.dataCriacao);

        return (
          // Comparação de Datas
          itemDate.getTime() === searchDate.getTime() ||

          // Campos Numéricos (tratando como string para busca)
          String(item.totalServicoComDesconto).toLowerCase().includes(term) ||
          String(item.id).toLowerCase().includes(term) ||
          String(item.aliquotaInterestadualDistribuidor).toLowerCase().includes(term) ||
          String(item.aliquotaInterestadualFornecedor).toLowerCase().includes(term) ||
          String(item.aliquotaInternaDistribuidor).toLowerCase().includes(term) ||
          String(item.aliquotaInternaFornecedor).toLowerCase().includes(term) ||
          String(item.aliquotaInternaVarejista).toLowerCase().includes(term) ||
          String(item.cabecalhoId).toLowerCase().includes(term) ||
          String(item.cest).toLowerCase().includes(term) ||
          String(item.comissaoDistribuidor).toLowerCase().includes(term) ||
          String(item.comissaoVarejista).toLowerCase().includes(term) ||
          String(item.dadosDistribuidoraliquotacofinsSaida).toLowerCase().includes(term) ||
          String(item.dadosDistribuidoraliquotaicms).toLowerCase().includes(term) ||
          String(item.dadosDistribuidoraliquotapisSaida).toLowerCase().includes(term) ||
          String(item.dadosDistribuidorcsll).toLowerCase().includes(term) ||
          String(item.dadosDistribuidorcst).toLowerCase().includes(term) ||
          String(item.dadosDistribuidorirpj).toLowerCase().includes(term) ||
          String(item.dadosDistribuidormvaAliquota12).toLowerCase().includes(term) ||
          String(item.dadosDistribuidormvaAliquota4).toLowerCase().includes(term) ||
          String(item.dadosDistribuidormvaAliquota7).toLowerCase().includes(term) ||
          String(item.dadosDistribuidormvaOriginal).toLowerCase().includes(term) ||
          String(item.dadosVarejistaaliquotacofinsSaida).toLowerCase().includes(term) ||
          String(item.dadosVarejistaaliquotaicms).toLowerCase().includes(term) ||
          String(item.dadosVarejistaaliquotapisSaida).toLowerCase().includes(term) ||
          String(item.dadosVarejistacsll).toLowerCase().includes(term) ||
          String(item.dadosVarejistacst).toLowerCase().includes(term) ||
          String(item.dadosVarejistairpj).toLowerCase().includes(term) ||
          String(item.dadosVarejistamvaAliquota12).toLowerCase().includes(term) ||
          String(item.dadosVarejistamvaAliquota4).toLowerCase().includes(term) ||
          String(item.dadosVarejistamvaAliquota7).toLowerCase().includes(term) ||
          String(item.dadosVarejistamvaOriginal).toLowerCase().includes(term) ||
          String(new Date(item.dataHoraInsercao).toLocaleDateString()).toLowerCase().includes(term) || // Busca na data de inserção formatada
          String(item.ncm).toLowerCase().includes(term) ||
          String(item.nfeCompraFornecedor).toLowerCase().includes(term) ||
          String(item.nfeTransferenciaDistribuidor).toLowerCase().includes(term) ||
          String(item.nfeVendaVarejista).toLowerCase().includes(term) ||
          String(item.percentualDesconto).toLowerCase().includes(term) ||
          String(item.percentualFreteCompra).toLowerCase().includes(term) ||
          String(item.percentualFreteTransferencia).toLowerCase().includes(term) ||
          String(item.percentualFreteVenda).toLowerCase().includes(term) ||
          String(item.percentualMargem).toLowerCase().includes(term) ||
          String(item.percentualTaxas).toLowerCase().includes(term) ||

          // Campos de Texto
          item.atividadeDistribuidor?.toLowerCase().includes(term) ||
          item.atividadeFornecedor?.toLowerCase().includes(term) ||
          item.atividadeVarejista?.toLowerCase().includes(term) ||
          item.nomeDistribuidor?.toLowerCase().includes(term) ||
          item.nomeFornecedor?.toLowerCase().includes(term) ||
          item.nomeProduto?.toLowerCase().includes(term) ||
          item.nomeVarejista?.toLowerCase().includes(term) ||
          item.nomeCliente?.toLowerCase().includes(term) ||
          item.numeroOs?.toLowerCase().includes(term)
        );
      });
    }
  }

  convertToDate(dateString: any): Date {
    if (dateString instanceof Date) {
      return dateString;
    }
    if (typeof dateString === 'string' && dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        // Check if the created date is valid
        if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
          return date;
        }
      }
    }
    return new Date(''); // Retorna uma data inválida para comparações falharem em outros casos
  }



    novoCadastroSimulacaoProduto() {
      // Gera um ID numérico baseado no timestamp atual + um número aleatório
      const idNumerico = Date.now() + Math.floor(Math.random() * 1000);
      this.router.navigate([`/simulador/produtos/criar/`, idNumerico.toString()]);
  }
  isNumericId(id: any): boolean {
    // Handle cases where id might be null or undefined
    if (id === null || id === undefined) {
      return false;
    }

    // Convert to string in case it's a number
    const idStr = id.toString();

    // Check if the string contains only digits
    return /^\d+$/.test(idStr);
  }


  async duplicarSimulacaoProduto(id: string) {
    // Mostrar diálogo de confirmação
    const confirm = await this.showConfirmationDialog();
    if (!confirm) return;

    try {
      // 1. Buscar o cabeçalho original
      const cabecalhoDoc = await this.firestore.collection('cabecalhoProdutos').doc(id).get().toPromise();

      if (!cabecalhoDoc?.exists) {
        throw new Error('Cabeçalho não encontrado');
      }

      // Definir tipo para os dados do cabeçalho
      const cabecalhoData = cabecalhoDoc.data() as {
        paraQuemSimulacao?: string;
        [key: string]: any;
      };

      // 2. Criar novo ID para o cabeçalho duplicado
      const novoCabecalhoId = Date.now() + Math.floor(Math.random() * 1000).toString();

      // 3. Criar cópia do cabeçalho com novos dados
      const cabecalhoDuplicado = {
        ...cabecalhoData,
        id: novoCabecalhoId,
        dataCriacao: new Date().toISOString(),
        finalizado: 'Não',
        situacao: 'Ativa',
        // Adicionar "(Cópia)" ao nome se existir
        paraQuemSimulacao: cabecalhoData.paraQuemSimulacao
          ? `${cabecalhoData.paraQuemSimulacao}`
          : 'Nova Simulação (Cópia)'
      };

      // 4. Salvar o novo cabeçalho
      await this.firestore.collection('cabecalhoProdutos').doc(novoCabecalhoId).set(cabecalhoDuplicado);

      // 5. Buscar e duplicar os produtos simulados
      const produtosQuery = await this.firestore.collection('produtosSimulados', ref =>
        ref.where('cabecalhoId', '==', id)
      ).get().toPromise();

      if (!produtosQuery) {
        throw new Error('Erro ao buscar produtos simulados');
      }

      const batch = this.firestore.firestore.batch();

      produtosQuery.forEach(doc => {
        const produtoData = doc.data() as { [key: string]: any };
        const novoProdutoId = this.firestore.createId();
        const produtoDuplicado = {
          ...produtoData,
          id: novoProdutoId,
          cabecalhoId: novoCabecalhoId,
          dataHoraInsercao: new Date().toISOString(),
          situacao: 'Ativa'
        };

        const novoProdutoRef = this.firestore.collection('produtosSimulados').doc(novoProdutoId).ref;
        batch.set(novoProdutoRef, produtoDuplicado);
      });

      // 6. Executar a batch de produtos
      await batch.commit();

      // 7. Mostrar mensagem de sucesso
      const toast = await this.toastController.create({
        message: 'Simulação duplicada com sucesso!',
        duration: 2000,
        color: 'success',
      });
      toast.present();

      // 8. Redirecionar para a edição da nova simulação
      this.router.navigate([`/simulador/produtos/editar/${novoCabecalhoId}`]);

    } catch (error) {
      console.error('Erro ao duplicar simulação:', error);
      const toast = await this.toastController.create({
        message: 'Erro ao duplicar simulação!',
        duration: 2000,
        color: 'danger',
      });
      toast.present();
    }
  }

  private async showConfirmationDialog(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.toastController.create({
        header: 'Confirmar',
        message: 'Deseja realmente duplicar esta simulação?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'Duplicar',
            handler: () => resolve(true)
          }
        ]
      });

      await alert.present();
    });
  }
}
