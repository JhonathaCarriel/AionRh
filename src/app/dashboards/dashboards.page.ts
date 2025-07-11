import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DashboardService } from '../services/dashboard.service';

Chart.register(ChartDataLabels);
@Component({
  selector: 'app-dashboards',
  templateUrl: './dashboards.page.html',
  styleUrls: ['./dashboards.page.scss'],
})
export class DashboardsPage implements AfterViewInit {
  @ViewChild('barChartComprasMes') barChartComprasMes: any;
  @ViewChild('barChartVendasMes') barChartVendasMes: any;
  @ViewChild('barChartLucroMes') barChartLucroMes: any;
  @ViewChild('barChartLucroMesServico') barChartLucroMesServico: any;

  constructor(private dashboardService: DashboardService) {}

  ngAfterViewInit() {
    this.loadSimulacoesProdutos();
    this.loadSimulacoesServicos();
    this.loadLucroProdutosPorMes();
    this.loadLucroServicosPorMes(); // Novo método para carregar lucro de serviços
  }

  loadSimulacoesProdutos() {
    this.dashboardService.getSimulacoesProdutosFinalizadas().subscribe(meses => {
      this.renderBarChart(this.barChartComprasMes, 'Simulações de Produtos', [meses], ['Simulações de Produtos']);
    });
  }

  loadSimulacoesServicos() {
    this.dashboardService.getSimulacoesServicosFinalizadas().subscribe(meses => {
      this.renderBarChart(this.barChartVendasMes, 'Simulações de Serviços', [meses], ['Simulações de Serviços']);
    });
  }

  loadLucroProdutosPorMes() {
    this.dashboardService.getLucroProdutosPorMes().subscribe(meses => {
      const lucroData = meses.map(mes => mes.lucro); // Extrai os valores de lucro
      const vendasData = meses.map(mes => mes.valorTotalVenda); // Extrai os valores de vendas
      this.renderBarChart(this.barChartLucroMes, 'Lucro e Vendas por Mês', [lucroData, vendasData], ['Lucro', 'Valor Total de Venda']);
    });
  }

  loadLucroServicosPorMes() {
    this.dashboardService.getLucroServicosPorMes().subscribe(meses => {
      const lucroData = meses.map(mes => mes.lucro); // Extrai os valores de lucro
      const servicoData = meses.map(mes => mes.totalServicoComDesconto); // Extrai os valores de serviços
      this.renderBarChart(this.barChartLucroMesServico, 'Lucro e Serviços por Mês', [lucroData, servicoData], ['Lucro', 'Valor Total de Serviços']);
    });
  }

  renderBarChart(chartRef: any, label: string, datasetsData: number[][], labels?: string[]) {
    const ctx = chartRef.nativeElement.getContext('2d');

    // Obtém o mês atual
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth(); // Janeiro = 0, Dezembro = 11

    // Calcula os últimos 6 meses, incluindo o mês atual
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const ultimos6Meses: string[] = []; // Array para armazenar os nomes dos últimos 6 meses
    const ultimos6MesesIndices: number[] = []; // Array para armazenar os índices dos últimos 6 meses

    for (let i = 0; i < 6; i++) {
      const mesIndex = (mesAtual - i + 12) % 12; // Calcula o índice do mês (considerando o ciclo de 12 meses)
      ultimos6Meses.unshift(meses[mesIndex]); // Adiciona o nome do mês no início do array
      ultimos6MesesIndices.unshift(mesIndex); // Adiciona o índice do mês no início do array
    }

    // Filtra os dados dos últimos 6 meses
    const ultimos6MesesData = datasetsData.map(data =>
      ultimos6MesesIndices.map(index => data[index])
    );

    const datasets = ultimos6MesesData.map((data, index) => ({
      label: labels ? labels[index] : label, // Usa o label personalizado ou o padrão
      data: data,
      backgroundColor: index === 0 ? '#072c04' : '#4A5568', // Cores diferentes para cada conjunto de dados
      borderColor: '#2D3748',
      borderWidth: 1,
      barThickness: 50, // Espessura da barra
      categoryPercentage: 0.8, // Espaço entre categorias
      barPercentage: 0.8, // Largura da barra
    }));

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ultimos6Meses, // Rótulos dos últimos 6 meses
        datasets: datasets,
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            display: false, // Remove as informações do eixo Y
            grid: {
              display: false, // Remove as linhas de grade do eixo Y
            }
          },
          x: {
            grid: {
              display: false, // Remove as linhas de grade do eixo X
            }
          }
        },
        plugins: {
          datalabels: {
            anchor: 'center',
            align: 'start',
            formatter: (value: number) => value.toFixed(2), // Formata o valor (2 casas decimais)
            color: '#fff',
            font: {
              weight: 'bold',
              size: 10
            }
          },
          legend: {
            display: true, // Exibe a legenda
            position: 'top'
          }
        }
      }
    });
  }
}