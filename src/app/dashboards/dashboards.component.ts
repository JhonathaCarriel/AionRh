import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';  // Certifique-se de importar o plugin corretamente

Chart.register(ChartDataLabels);  // Registra o plugin no Chart.js

@Component({
  selector: 'app-dashboards',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule],
  templateUrl: './dashboards.component.html',
  styleUrls: ['./dashboards.component.scss'],
})
export class DashboardsComponent implements AfterViewInit {
  @ViewChild('barChartComprasMes') barChartComprasMes: any;
  @ViewChild('barChartVendasMes') barChartVendasMes: any;
  @ViewChild('barChartLucroMes') barChartLucroMes: any;  // Adicionando referência para o gráfico de lucro

  // Dados fictícios para gráficos
  comprasPorMes: number[] = [15000, 20000, 18000, 25000, 22000]; // Compras mensais
  vendasPorMes: number[] = [12000, 13000, 14000, 18000, 16000]; // Vendas mensais
  lucroPorMes: number[] = [5000, 7000, 6500, 9000, 8000]; // Lucro mensal
  meses: string[] = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai']; // Meses de Janeiro a Maio

  ngAfterViewInit() {
    this.loadChartData();
  }

  loadChartData() {
    // Garantir que os gráficos estão sendo carregados
    if (this.barChartComprasMes && this.barChartVendasMes && this.barChartLucroMes) {
      this.drawBarChart(
        this.barChartComprasMes.nativeElement,
        this.meses,
        this.comprasPorMes,
        'Compras x Mês',
        ['#8B0000', '#006400', '#00008B', '#8B008B', '#A52A2A'] // Cores escuras para as barras
      );
      this.drawBarChart(
        this.barChartVendasMes.nativeElement,
        this.meses,
        this.vendasPorMes,
        'Vendas x Mês',
        ['#8B0000', '#006400', '#00008B', '#8B008B', '#A52A2A'] // Cores escuras para as barras
      );
      this.drawBarChart(
        this.barChartLucroMes.nativeElement,
        this.meses,
        this.lucroPorMes,
        'Lucro x Mês',
        ['#8B0000', '#006400', '#00008B', '#8B008B', '#A52A2A'] // Cores escuras para as barras
      );
    }
  }

  drawBarChart(
    canvas: HTMLCanvasElement,
    labels: string[],
    data: number[],
    title: string,
    barColors: string[]
  ) {
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: title,
            data: data,
            backgroundColor: barColors,  // Usando as cores escuras passadas
            borderWidth: 0,  // Removendo a borda das barras
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            display: true,  // Exibindo o eixo Y
            beginAtZero: true, // Começa o eixo Y no zero
          },
          x: {
            beginAtZero: true,  // Começa o eixo X no zero
          },
        },
        plugins: {
          
        },
      },
    });
  }
}
