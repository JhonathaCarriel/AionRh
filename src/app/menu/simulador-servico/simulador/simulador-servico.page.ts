import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
export interface cabecalhoServicos {
  id: string;
  atividadeVarejista: string;
  finalizado: string;
  nfsServicoVarejista: string;
  nomeVarejista: string;
  situacao: string;
  ufVarejista: string;
}
@Component({
  selector: 'app-simulador-servico',
  templateUrl: './simulador-servico.page.html',
  styleUrls: ['./simulador-servico.page.scss'],
})
export class SimuladorServicoPage implements OnInit {
  pageTitle: string = 'Simulador de serviço';
  TitleSubheader: string = '';
  searchTerm: string = '';
  simulacaoServico: any[] = [];

  cabecalhos: any[] = [];



  constructor(
    private firestore: AngularFirestore,
    private router: Router,
    private toastController: ToastController
  ) { }


  ngOnInit() {
    this.carregarCabecalhos();
  }

  carregarCabecalhos() {
    this.firestore.collection('cabecalhoServico', ref =>
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


  editarCabecalho(id: string) {
    this.router.navigate([`/simulador/servico/editar/${id}`]);
  }


  novoCadastroSimulacaoServico() {
      // Gera um ID numérico baseado no timestamp atual + um número aleatório
      const idNumerico = Date.now() + Math.floor(Math.random() * 1000);
      this.router.navigate([`/simulador/servico/criar/`, idNumerico.toString()]);

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
      // Converte a searchTerm para um objeto Date, assumindo que o formato seja "dd/MM/yyyy"
      const searchDate = this.convertToDate(this.searchTerm);

      this.cabecalhos = this.cabecalhos.filter(item => {
        const itemDate = this.convertToDate(item.dataCriacao);

        // Compara as datas
        return (
          itemDate.getTime() === searchDate.getTime() ||  // Verifica se as datas são iguais
          String(item.totalServicoComDesconto).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          item.paraQuemSimulacao.toLowerCase().includes(this.searchTerm.toLowerCase())||
          item.numeroOs.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      });
    }
  }

  // Função para converter a string no formato "dd/MM/yyyy" para um objeto Date
  convertToDate(dateString: string): Date {
    const [day, month, year] = dateString.split('/');
    return new Date(`${year}-${month}-${day}`);
  }


  async excluirCabecalho(id: string) {
    try {
      // Atualizar a situação do cabeçalho para "Cancelada"
      await this.firestore.collection('cabecalhoServico').doc(id).update({
        situacao: 'Cancelada'
      });

      // Buscar os serviçosSimulados vinculados ao cabeçalho
      const servicosRef = this.firestore.collection('servicosSimulados', ref =>
        ref.where('cabecalhoId', '==', id)
      );

      servicosRef.get().subscribe(snapshot => {
        snapshot.forEach(doc => {
          doc.ref.update({ situacao: 'Cancelada' });
        });
      });

      // Exibir mensagem de sucesso
      const toast = await this.toastController.create({
        message: 'Cabeçalho cancelado com sucesso!',
        duration: 2000,
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


}
