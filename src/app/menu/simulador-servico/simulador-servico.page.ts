import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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



  constructor(
    private router: Router,
  ) { }


  ngOnInit() {
    this.loadColaboradorData();
  }

  novoCadastroSimulacaoServico(){
   this.router.navigate(['/simulador/servico/criar']);
  }

  loadColaboradorData(){
    console.log('loadColaboradorData');
  }

  filterItems() {
    if (this.searchTerm.trim() === '') {

      this.loadColaboradorData();
    } else {
      this.simulacaoServico = this.simulacaoServico.filter(item =>
        item.nomeCompleto.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.cpf.toLowerCase().includes(this.searchTerm.toLowerCase())||
        item.matricula.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  onSearchChange() {
    this.filterItems();
  }

  onSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.filterItems();
  }

}
