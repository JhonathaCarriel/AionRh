import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export interface CatalogItem {
  id: string;
  referenciaInterna: string;
  codigo: string;
  haste: number;
  embolo: number;
  descricao: string;
  cilindro?: string;
  equipamento: string;
  marca: string;
  imagemUrl?: string;
}

export interface Cabecalhos {
  id: string;
  nome: string;
  dataCriacao: Date;
  logoUrl: string;
  fundoCapaUrl: string;
  itens: CatalogItem[];
  finalizado?: boolean;
}
@Component({
  selector: 'app-visualizar',
  templateUrl: './visualizar.page.html',
  styleUrls: ['./visualizar.page.scss'],
})
export class VisualizarPage implements OnInit {
  cabecalhos: Cabecalhos[] = []



  constructor(
    private router: Router,
  ) { }


  ngOnInit() {
    // Initialize cabecalhos or perform setup logic
    this.cabecalhos = [
      {
        id: '1',
        nome: 'Catálogo Exemplo',
        dataCriacao: new Date(),
        logoUrl: 'assets/logo.png',
        fundoCapaUrl: 'assets/fundo-capa.png',
        itens: [],
        finalizado: false
      }
    ];
  }

  novoCatalago(){
    const idNumerico = Date.now() + Math.floor(Math.random() * 1000);
    this.router.navigate(['/catalogos/criar', idNumerico.toString()]);
  }

  onSearch(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    console.log(searchTerm);}


    excluirCabecalho(){

    }

    editarCabecalho(){

    }
    duplicarSimulacaoProduto(){

    }

}
