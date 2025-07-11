import { BotaoFlutuanteComponent } from './../../../botao-flutuante/botao-flutuante.component';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormGroup, FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ModalController, ToastController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AliquotasService } from 'src/app/services/aliquotas.service';
import { FirebaseNCMService } from 'src/app/services/firebase-ncm.service';
import {jsPDF} from 'jspdf'
import "jspdf-autotable";
import * as XLSX from 'xlsx';
import { DadosTabela } from '../../simulador-produtos/tabela/tabela.component';
import { ActivatedRoute } from '@angular/router';
import { RelatorioService } from '../servicos/relatorios.service';
import { Servicos } from '../criar/criar.page';
import { OdooApiService } from '../servicos/odoo.service';
import { LoggerService } from 'src/app/services/logger.service';


declare module 'jspdf' {
  interface jsPDF {
    autoTable: any;
    autoTableEndPosY: any; // Add this line to extend jsPDF with autoTable
  }
}
// Interface para tipagem dos dados editáveis
interface DadosEditaveis {
  nomeServico: string;
  percentualMargem: number,
  percentualDesconto: number,
  comissaoVarejista: number,
  comissaoDistribuidor: number,
  percentualTaxas: number,


}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BotaoFlutuanteComponent ,
  ],
  selector: 'app-tabela',
  templateUrl: './tabela.component.html',
  styleUrls: ['./tabela.component.scss'],
})
export class TabelaComponent  implements OnInit {
  @Input() dadosTabela: any[] = [];

  @Input() simuladorServicoForm!: FormGroup;
  @Output() editar = new EventEmitter<any>();  // Emite os dados para a página
  copiaEditavel: Partial<Servicos> | null = null;

  mostrarCodigo: boolean = false;
  selectedItemIndex: number = -1;
  informacaoDestinacao: [] = [];
  servicoId: string =''
  cabecalhoId: string =''


  constructor(
     private modalController: ModalController,
    private firestore: AngularFirestore,
    private loggerService: LoggerService,
    private FirebaseNCMService: FirebaseNCMService,  // Injeta o serviço
    public aliquotasService: AliquotasService,
    private location: Location,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private alertController: AlertController,
    public relatorioService: RelatorioService,
    private odooApiService: OdooApiService

  ) { }

  ngOnInit() {
    this.servicoId = this.route.snapshot.paramMap.get('id')!;
    this.cabecalhoId = this.route.snapshot.paramMap.get('id')!;


  }



  // Função para formatar valores em BRL
  formatBRL(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  nomeVarejista(item: any): string {
    return item.nomeVarejista;
  }




  async finalizarSimulacao() {
    if (!this.cabecalhoId) {
      console.error('Cabeçalho de serviço não encontrado.');
      return;
    }

    // Calcular os valores no momento da finalização
    const totalServicoComDesconto = this.totalServicoComDesconto;  // Acessa o valor calculado pelo getter
    const totalLucroReais = this.totalLucroReais;  // Acessa o valor calculado pelo getter
    const dataFinalizacao = new Date();  // Data de finalização (data atual)

    try {
      await this.firestore.collection('cabecalhoServico').doc(this.cabecalhoId).update({
        finalizado: 'Sim',
        totalServicoComDesconto: totalServicoComDesconto,
        totalLucroReais: totalLucroReais,
        dataFinalizacao: dataFinalizacao
      });

      const toast = await this.toastController.create({
        message: 'Simulação finalizada!',
        duration: 1000,
        color: 'success',
      });
      toast.present();
    } catch (error) {
      console.error('Erro ao finalizar simulação:', error);
      const toast = await this.toastController.create({
        message: 'Erro ao finalizar simulação!',
        duration: 1000,
        color: 'danger',
      });
      toast.present();
    }
  }

  removeItem(item: DadosTabela, index: number) {
    this.alertController.create({
      header: 'Confirmar Exclusão',
      message: 'Tem certeza de que deseja remover este item?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Remover',
          handler: async () => {
            try {
              await this.firestore.collection('servicosSimulados').doc(item.id).delete();

              // Log da exclusão
              await this.loggerService.registrarLog(
                'exclusao',
                'servicosSimulados',
                item.id,
                item  // enviando o objeto removido para referência no log
              );

              this.dadosTabela = [...this.dadosTabela.filter((_, i) => i !== index)];

              const toast = await this.toastController.create({
                message: 'Item removido com sucesso!',
                duration: 1000,
                color: 'success'
              });
              toast.present();
            } catch (error) {
              console.error('Erro ao remover item:', error);

              // Log de erro na exclusão
              await this.loggerService.registrarLog(
                'erro',
                'servicosSimulados',
                item.id,
                null,
                null,
                `Erro ao remover item: ${(error instanceof Error ? error.message : 'Erro desconhecido')}`
              );

              const toast = await this.toastController.create({
                message: 'Erro ao remover item.',
                duration: 1000,
                color: 'danger'
              });
              toast.present();
            }
          }
        }
      ]
    }).then(alert => alert.present());
  }





  async editarItem(item: DadosTabela, index: number) {
    this.editar.emit({ item, index });

    try {
      await this.firestore.collection('servicosSimulados').doc(item.id).delete();

      // Log da exclusão no Firestore
      await this.loggerService.registrarLog(
        'exclusao',
        'servicosSimulados',
        item.id,
        item // opcional: passar o objeto excluído para referência
      );

      // Remove o item da tabela local após exclusão bem sucedida
      this.dadosTabela.splice(index, 1);
    } catch (error) {
      alert('Erro ao excluir Item');
      console.error('Erro ao excluir Item: ', error);

      // Log do erro na exclusão
      await this.loggerService.registrarLog(
        'erro',
        'servicosSimulados',
        item.id,
        null,
        null,
        `Erro ao excluir item: ${(error instanceof Error ? error.message : 'Erro desconhecido')}`
      );
    }
  }


  //Relatórios
  printContent() {
    this.relatorioService.printContent(this.dadosTabela, this.totalServicoMecanico, this.totalServicoSemDesconto, this.totalServicoComDesconto, this.totalImpostosRetidos, this.totalImpostosNaoRetidos, this.totalDespesas, this.totalLucroReais, this.totalLucroPercentual);
  }
  exportToExcel() {
    this.relatorioService.exportToExcel(this.dadosTabela, this.totalServicoMecanico, this.totalServicoSemDesconto, this.totalServicoComDesconto, this.totalImpostosRetidos, this.totalImpostosNaoRetidos, this.totalDespesas, this.totalLucroReais, this.totalLucroPercentual);
  }
  printDRE() {
    this.relatorioService.printDRE(this.dadosTabela, this.totalServicoMecanico, this.totalServicoSemDesconto, this.totalServicoComDesconto, this.totalImpostosRetidos, this.totalImpostosNaoRetidos, this.totalDespesas, this.totalLucroReais, this.totalLucroPercentual, this.totalCSLLRetido, this.totalPis, this.totalCofins, this.totalCSLL, this.totalIRPJ, this.totalIss, this.totalComissaoD, this.totalComissaoV, this.totalTaxas);
  }



  calculateVTServico(item: any): number {
    const valorCusto = parseFloat(item.valorServicoMecanico + item.valorMateriais) || 0;
    const margem = parseFloat(item.percentualMargem) || 0;
    return (valorCusto * (margem / 100)) + valorCusto;
  }
  calculateVTServicoComDesconto(item: any): number {
    const calculateVTServico = this.calculateVTServico(item);
    const desconto = parseFloat(item.percentualDesconto) || 0;
    return calculateVTServico - (calculateVTServico * (desconto / 100));
  }

  caculateTotalImpostoRetido(item: any): number {
    const csllRetido = this.calculateCSLLRetido(item) || 0;
    const pis = this.calculatealiquotapisSaida(item) || 0;
    const cofins = this.calculatealiquotaCofinsSaida(item) || 0;

    return csllRetido + pis + cofins;
}

caculateTotalImpostoNaoRetido(item: any): number {
  const iss = this.calculateIss(item) || 0; // Já calcula apenas sobre o serviço
  const irpj = this.calculateIRPJ(item) || 0;
  const csll = this.calculateCSLL(item) || 0;
  return iss + irpj + csll;
}
  caculateTotalDespesas(item: any): number {
    const comissaoDistribuidor = parseFloat(item.comissaoDistribuidor) || 0;
    const comissaoVarejista = parseFloat(item.comissaoVarejista) || 0;
    const percentualTaxas = parseFloat(item.percentualTaxas) || 0;

    const totalAliquota = comissaoDistribuidor + comissaoVarejista + percentualTaxas;

    // Calcula o valor do serviço com desconto
    const calculateVTServicoComDesconto = this.calculateVTServicoComDesconto(item) || 0;

    // Soma as comissões
    return calculateVTServicoComDesconto * (totalAliquota/100);
  }
  caculateTotalLucroReais(item: any): number {

    const valorServicoMecanico = parseFloat(item.valorServicoMecanico + item.valorMateriais) || 0;
    const totalImpostoRetido = this.caculateTotalImpostoRetido(item) || 0;
    const totalImpostoNaoRetido = this.caculateTotalImpostoNaoRetido(item) || 0;
    const totalDespesas = this.caculateTotalDespesas(item) || 0;

    const calculateVTServicoComDesconto = this.calculateVTServicoComDesconto(item) || 0;

    return calculateVTServicoComDesconto - totalImpostoRetido - totalImpostoNaoRetido - totalDespesas - valorServicoMecanico;
  }

  caculateTotalLucroPercentual(item: any): number {
    const totalLucroReais = this.caculateTotalLucroReais(item) || 0;
    const calculateVTServicoComDesconto = this.calculateVTServicoComDesconto(item) || 0;


    return (totalLucroReais / calculateVTServicoComDesconto) * 100;
  }

calculateIRPJ(item: any): number {
    const baseCalculo = this.calculateVTServicoComDesconto(item) || 0;
    const irpj = item.irpj || 0;
    return baseCalculo * (irpj/100);
}

calculateCSLL(item: any): number {
    const baseCalculo = this.calculateVTServicoComDesconto(item) || 0;
    const csll = item.csll || 0;
    return baseCalculo * (csll/100);
}

calculateCSLLRetido(item: any): number {

    const baseCalculo = this.calculateVTServicoComDesconto(item) || 0;
    const csll = item.csllRetido || 0;
    return baseCalculo * (csll/100);
}
calculatealiquotapisSaida(item: any): number {
  const baseCalculo = this.calculateVTServicoComDesconto(item) || 0;
  const PIS = item.aliquotapisSaida || 0;
  return baseCalculo * (PIS/100);
}

calculatealiquotaCofinsSaida(item: any): number {
  const baseCalculo = this.calculateVTServicoComDesconto(item) || 0;
  const cofins = item.aliquotacofinsSaida || 0;
  return baseCalculo * (cofins/100);
}



 calculateIss(item: any): number {
  const valorServico = item.valorServicoMecanico || 0;
  const margem = (item.percentualMargem || 0) / 100;
  const valorCusto = (valorServico * margem) + valorServico || 0;
  const desconto = (item.percentualDesconto || 0) / 100;

  const valorServicoComDesconto = valorCusto - (valorCusto * desconto) || 0;

  const aliquotaISS = (item.aliquotaISS || 0) / 100;


  const baseCalculo = valorServicoComDesconto || 0;


  const valorISS = baseCalculo * aliquotaISS;


  return valorISS;

}


  calculateComissaoV(item: any): number{
    const calculateVTServicoComDesconto = this.calculateVTServicoComDesconto(item) || 0;
    const comissao = item.comissaoVarejista
    return calculateVTServicoComDesconto * (comissao/100)
  }
  calculateComissaoD(item: any): number{
    const calculateVTServicoComDesconto = this.calculateVTServicoComDesconto(item) || 0;
    const comissao = item.comissaoDistribuidor
    return calculateVTServicoComDesconto * (comissao/100)
  }
  calculateTaxas(item: any): number{
    const calculateVTServicoComDesconto = this.calculateVTServicoComDesconto(item) || 0;
    const taxas = item.percentualTaxas
    return calculateVTServicoComDesconto * (taxas/100)
  }



 // Gets para fazer a somatória dos calculos

  get totalTaxas(){
    return this.dadosTabela.reduce((total, item) => total + this.calculateTaxas(item), 0);
  }
  get totalComissaoD(){
    return this.dadosTabela.reduce((total, item) => total + this.calculateComissaoD(item), 0);
  }
  get totalComissaoV(){
    return this.dadosTabela.reduce((total, item) => total + this.calculateComissaoV(item), 0);
  }
  get totalIRPJ(){
    return this.dadosTabela.reduce((total, item) => total + this.calculateIRPJ(item), 0);
  }
  get totalIss(){
    return this.dadosTabela.reduce((total, item) => total + this.calculateIss(item), 0);
  }
  get totalCofins(){
    return this.dadosTabela.reduce((total, item) => total + this.calculatealiquotaCofinsSaida(item), 0);
  }
  get totalPis(){
    return this.dadosTabela.reduce((total, item) => total + this.calculatealiquotapisSaida(item), 0);
  }
  get totalCSLL(){
    return this.dadosTabela.reduce((total, item) => total + this.calculateCSLL(item), 0);
  }
  get totalCSLLRetido(){
    return this.dadosTabela.reduce((total, item) => total + this.calculateCSLLRetido(item), 0);
  }
  get totalServicoMecanico() {
    return this.dadosTabela.reduce((total, item) => total + parseFloat(item.valorServicoMecanico + item.valorMateriais), 0);
  }
  get totalServicoSemDesconto() {
    return this.dadosTabela.reduce((total, item) => total + this.calculateVTServico(item), 0);
  }
  get totalServicoComDesconto() {
    return this.dadosTabela.reduce((total, item) => total + this.calculateVTServicoComDesconto(item), 0);
  }
  get totalImpostosRetidos() {
    return this.dadosTabela.reduce((total, item) => total + this.caculateTotalImpostoRetido(item), 0);
  }
  get totalImpostosNaoRetidos() {
    return this.dadosTabela.reduce((total, item) => total + this.caculateTotalImpostoNaoRetido(item), 0);
  }
  get totalDespesas() {
    return this.dadosTabela.reduce((total, item) => total + this.caculateTotalDespesas(item), 0);
  }
  get totalLucroReais() {
    return this.dadosTabela.reduce((total, item) => total + this.caculateTotalLucroReais(item), 0);
  }
  get totalLucroPercentual(): number {
    if (this.totalServicoComDesconto === 0) {
      return 0; // Or handle as appropriate, e.g., return null if you want to display nothing
    }
    return this.totalLucroReais / this.totalServicoComDesconto;
  }

  async iniciarEdicao(item: Servicos & { editando?: boolean }): Promise<void> {
    if (!item) return;

    item.editando = true;
    // Faz uma cópia profunda apenas dos campos editáveis
    this.copiaEditavel = <Partial<Servicos>>{
      nomeServico: item.nomeServico,
      percentualMargem: item.percentualMargem,
      percentualDesconto: item.percentualDesconto,
      comissaoVarejista: item.comissaoVarejista,
      comissaoDistribuidor: item.comissaoDistribuidor,
      percentualTaxas: item.percentualTaxas,

    };
  }

  // Método para validar os dados antes de salvar
  private validarDados(item: DadosEditaveis): boolean {
    return (
      item.nomeServico?.trim() !== ''
      && item.percentualMargem !== 0
      && item.percentualDesconto !== 0
      && item.comissaoVarejista !== 0
      && item.comissaoDistribuidor !== 0
      && item.percentualTaxas !== 0

    );
  }

  async finalizarEdicao(item: Servicos & { editando?: boolean }, applyToAll: boolean = false): Promise<void> {
    if (!item?.editando || !this.copiaEditavel) return;

    // Valida os dados antes de salvar
    if (!this.validarDados(item)) {
      await this.mostrarToast('Dados inválidos. Verifique os valores informados.', 'warning');
      return;
    }

    try {
      // Pergunta se quer aplicar a todos os itens (se não foi já definido)
      if (!applyToAll && this.shouldAskApplyToAll(item)) {
        const confirm = await this.showApplyToAllConfirmation();
        if (confirm === 'all') {
          await this.applyChangesToAllItems(item);
          item.editando = false;          // atualiza estado do item
          this.copiaEditavel = null;      // limpa a cópia
          return;
        } else if (confirm === 'cancel') {
          this.reverterAlteracoes(item);
          item.editando = false;
          return;
        }
      }

      // Atualiza apenas o item atual se não for para aplicar a todos
      const dadosAtualizacao: Partial<DadosEditaveis> = this.getUpdateData(item);

      if (!applyToAll) {
        await this.firestore.collection('servicosSimulados')
          .doc(item.id)
          .update(dadosAtualizacao);

        // Log da atualização individual
        await this.loggerService.registrarLog(
          'atualizacao',
          'servicosSimulados',
          item.id,
          dadosAtualizacao
        );
      }

      await this.mostrarToast('Dados atualizados com sucesso!', 'success');

    } catch (error) {
      console.error('Erro ao atualizar:', error);
      this.reverterAlteracoes(item);

      // Log do erro na atualização
      await this.loggerService.registrarLog(
        'erro',
        'servicosSimulados',
        item.id,
        null,
        null,
        `Erro ao atualizar item: ${(error instanceof Error ? error.message : 'Erro desconhecido')}`
      );

      await this.mostrarToast('Erro ao atualizar os dados. Tente novamente.', 'danger');
    } finally {
      if (!applyToAll) {
        item.editando = false;
        this.copiaEditavel = null;
      }
    }
  }



  private async showApplyToAllConfirmation(): Promise<'current' | 'all' | 'cancel'> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Aplicar a todos?',
        message: 'Deseja aplicar esta alteração a todos os itens da lista?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: async () => {
              await alert.dismiss();
              resolve('cancel');
            }
          },
          {
            text: 'Apenas este',
            handler: async () => {
              await alert.dismiss();
              resolve('current');
            }
          },
          {
            text: 'Todos os itens',
            handler: async () => {
              await alert.dismiss();
              resolve('all');
            }
          }
        ]
      });

      await alert.present();
    });
  }

  private getUpdateData(item: Servicos): Partial<DadosEditaveis> {
    return {
      nomeServico: item.nomeServico,
      percentualMargem: item.percentualMargem,
      percentualDesconto: item.percentualDesconto,
      comissaoVarejista: item.comissaoVarejista,
      comissaoDistribuidor: item.comissaoDistribuidor,
      percentualTaxas: item.percentualTaxas,

    };
  }
  private async applyChangesToAllItems(sourceItem: Servicos): Promise<void> {
    const batch = this.firestore.firestore.batch();
    const logs: Promise<void>[] = [];

    this.dadosTabela.forEach(item => {
      const itemRef = this.firestore.collection('produtosSimulados').doc(item.id).ref;

      const updateData: Partial<Servicos> = {};

      if (sourceItem.nomeServico !== this.copiaEditavel?.nomeServico) {
        updateData.nomeServico = sourceItem.nomeServico;
      }
      if (sourceItem.percentualMargem !== this.copiaEditavel?.percentualMargem) {
        updateData.percentualMargem = sourceItem.percentualMargem;
      }
      if (sourceItem.percentualDesconto !== this.copiaEditavel?.percentualDesconto) {
        updateData.percentualDesconto = sourceItem.percentualDesconto;
      }
      if (sourceItem.comissaoVarejista !== this.copiaEditavel?.comissaoVarejista) {
        updateData.comissaoVarejista = sourceItem.comissaoVarejista;
      }
      if (sourceItem.comissaoDistribuidor !== this.copiaEditavel?.comissaoDistribuidor) {
        updateData.comissaoDistribuidor = sourceItem.comissaoDistribuidor;
      }
      if (sourceItem.percentualTaxas !== this.copiaEditavel?.percentualTaxas) {
        updateData.percentualTaxas = sourceItem.percentualTaxas;
      }

      if (Object.keys(updateData).length > 0) {
        batch.update(itemRef, updateData);
        Object.assign(item, updateData);

        // Registra log de atualização para o item
        logs.push(
          this.loggerService.registrarLog(
            'atualizacao',
            'produtosSimulados',
            item.id,
            updateData
          )
        );
      }

      item.editando = false;
    });

    try {
      await batch.commit();
      await Promise.all(logs); // espera todos os logs serem registrados
      await this.mostrarToast(`Alterações aplicadas a ${this.dadosTabela.length} itens!`, 'success');
    } catch (error) {
      console.error('Erro ao atualizar em lote:', error);

      // Log de erro geral
      await this.loggerService.registrarLog(
        'erro',
        'produtosSimulados',
        'lote',
        null,
        null,
        `Erro ao aplicar alterações em lote: ${(error instanceof Error ? error.message : 'Erro desconhecido')}`
      );

      await this.mostrarToast('Erro ao aplicar alterações a todos os itens.', 'danger');
    } finally {
      this.copiaEditavel = null;
    }
  }


  // Método auxiliar para determinar se deve perguntar sobre aplicar a todos
  private shouldAskApplyToAll(item: Servicos): boolean {
    // Só pergunta para certos campos que fazem sentido aplicar a todos
    const editableFields = [
      'percentualMargem',
      'percentualDesconto'
      ,'comissaoVarejista'
      ,'comissaoDistribuidor'
      ,'percentualTaxas'
    ];

    return editableFields.some(field =>
      this.copiaEditavel && (item[field as keyof Servicos] !== this.copiaEditavel[field as keyof Servicos])
    );
  }

  // Método auxiliar para reverter alterações
  private reverterAlteracoes(item: Servicos): void {
    if (!this.copiaEditavel) return;

    item.nomeServico = this.copiaEditavel.nomeServico ?? '';

  }

  // Método auxiliar para mostrar feedback ao usuário
  private async mostrarToast(mensagem: string, cor: string): Promise<void> {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 1000,
      color: cor,
      position: 'bottom',
    });
    await toast.present();
  }


  salvarSimulacaoParaOdoo() {
    this.odooApiService.login().then(() => {
      for (const item of this.dadosTabela) {
        const dataToSend = {
          name: item.nomeServico,

          // Adicione outros campos conforme seu modelo Odoo
        };

        this.odooApiService.createRecord('sale.order', dataToSend)
          .then(result => {
            if (result) {
              console.log('Registro criado com ID:', result);
            } else {
              console.warn('Falha ao criar registro para item:', item);
            }
          });
      }
    });
  }


}


