import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import { LogAlteracao } from '../simulador-produtos/criar/criar.page';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.page.html',
  styleUrls: ['./logs.page.scss'],
})
export class LogsPage implements OnInit {
  logs: LogAlteracao[] = [];
  filteredLogs: LogAlteracao[] = [];
  searchTerm = '';
  showModal = false;
  selectedLog: LogAlteracao | null = null;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private firestore: AngularFirestore,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.fetchLogs();
  }

  async fetchLogs(): Promise<void> {
    try {
      const snapshot = await this.firestore
        .collection<LogAlteracao>('logs', ref => ref.orderBy('dataHora', 'desc'))
        .get()
        .toPromise();

      if (snapshot) {
        this.logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.filteredLogs = [...this.logs];
        this.updateTotalPages();
      }
    } catch (error) {
      console.error('Erro ao carregar os logs:', error);
    }
  }

  updateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredLogs.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  onSearch(term: string): void {
    this.searchTerm = term.toLowerCase();
    this.applyFilter();
    this.currentPage = 1;
    this.updateTotalPages();
  }

  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredLogs = [...this.logs];
      return;
    }

    this.filteredLogs = this.logs.filter(log =>
      [log.usuario, log.tipoOperacao, log.colecaoAlvo, log.documentoAlvoId]
        .some(field => field?.toLowerCase().includes(this.searchTerm))
    );
  }

  getActionClass(action: string): string {
    const classMap: Record<string, string> = {
      criacao: 'creation',
      atualizacao: 'update',
      exclusao: 'delete',
      consulta: 'consult',
      erro: 'error',
    };
    return classMap[action] || '';
  }

  getActionName(action: string): string {
    const nameMap: Record<string, string> = {
      criacao: 'Criação',
      atualizacao: 'Atualização',
      exclusao: 'Exclusão',
      consulta: 'Consulta',
      erro: 'Erro',
    };
    return nameMap[action] || action;
  }

  showDetails(log: LogAlteracao): void {
    this.selectedLog = log;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedLog = null;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  getPaginatedLogs(): LogAlteracao[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredLogs.slice(start, start + this.itemsPerPage);
  }
  formatTimestamp(timestamp: any): string {
    if (!timestamp) return '';

    // Se for um objeto Timestamp do Firebase
    if (timestamp.seconds && timestamp.nanoseconds) {
      const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
      return date.toLocaleString('pt-BR');
    }
    // Se já for uma string ou Date
    else if (timestamp instanceof Date) {
      return timestamp.toLocaleString('pt-BR');
    }
    // Se for uma string ISO
    else if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleString('pt-BR');
    }

    return timestamp.toString();
  }
}
