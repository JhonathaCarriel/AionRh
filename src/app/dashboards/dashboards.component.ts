import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'chartjs-plugin-datalabels';
import { NONE_TYPE } from '@angular/compiler';
Chart.register(ChartDataLabels);

export interface Avaliacao {
  id: string;
  categoria: string;
  previstoPAC: string;
  cargaHoraria: string;
  setor: string;
  pontuacao: string;
  dataAtividade: string;
  avaliacao: string;
  colaborador: string
}
@Component({
  selector: 'app-dashboards',
  standalone:true,
  imports: [
    CommonModule, RouterModule, IonicModule
  ],
  providers: [
  ],
  templateUrl: './dashboards.component.html',
  styleUrls: ['./dashboards.component.scss'],
})
export class DashboardsComponent  implements OnInit {
  avaliacao: Avaliacao[] = [];
  @ViewChild('barChartMaiorPontuacao') barChartMaiorPontuacao: any;
  @ViewChild('barChartColaboradoresPontuacao') barChartColaboradoresPontuacao: any;
  @ViewChild('pieChartSetorMediaPontuacao') pieChartSetorMediaPontuacao: any;
  @ViewChild('pieCharColaboradorCategoria') pieCharColaboradorCategoria: any;

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.loadChartData();
  }
  loadChartData() {
    this.firestore.collection<Avaliacao>('avaliacaoAtividades').valueChanges().subscribe((data: Avaliacao[]) => {
      const setores = data.map(avaliacao => avaliacao.setor);
      const pontuacoes = data.map(avaliacao => parseFloat(avaliacao.pontuacao)); 
      const colaboradores = data.map(avaliacao => avaliacao.colaborador);
      const categorias = data.map(avaliacao => avaliacao.categoria);
  
      this.drawBarChart(this.barChartMaiorPontuacao.nativeElement, setores, pontuacoes, 'Setor com maior pontuação');
      this.drawBarChart(this.barChartColaboradoresPontuacao.nativeElement, colaboradores, pontuacoes, 'Colaboradores X Quantidade de Pontos');
      this.drawBarChart(this.pieChartSetorMediaPontuacao.nativeElement, setores, pontuacoes, 'Setor X Média de Pontuação');
      this.drawPieChart(this.pieCharColaboradorCategoria.nativeElement, colaboradores, categorias, 'Colaborador x Categoria');
    });
  }
  
  drawBarChart(canvas: HTMLCanvasElement, labels: string[], data: number[], title: string) {
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: title,
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  drawPieChart(canvas: HTMLCanvasElement, labels: string[], data: any[], title: string) {
    new Chart(canvas, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: title,
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
    });
  }
  

}
