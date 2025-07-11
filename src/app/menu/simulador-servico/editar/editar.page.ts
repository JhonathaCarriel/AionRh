import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EstadoAliquota, Servicos } from '../criar/criar.page';
import { AliquotasService } from 'src/app/services/aliquotas.service';
import { ModalController, ToastController } from '@ionic/angular';
import { CNAEs } from 'src/app/cnae/cnae.page';
import { Fornecedores } from '../../fornecedores/fornecedores.component';
import { CriarComponent } from '../../fornecedores/criar/criar.component';
import { LoggerService } from 'src/app/services/logger.service';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
})
export class EditarPage implements OnInit {
  pageTitle: string = 'Editar Simulação de Serviço'

  cabecalhoId: string = '';
  servicoId: string = '';
  varejistas: Fornecedores[] = [];
  simuladorServicoForm!: FormGroup;

  tabelaInformacoes: any[] = [];
  servicosSimulados: Servicos[] = [];
  estados: EstadoAliquota[] = [];


  atividades = [
    { nome: 'Atacadista' },
    { nome: 'Distribuidor' },
    { nome: 'Fabricante' },
    { nome: 'Varejista' },
    { nome: 'Indústria' }
  ];

  boleanos = [
    { nome: 'Sim', value: 'Sim' },
    { nome: 'Não', value: 'Nao' }
  ];

  servicoPreenchido: boolean = false;
  materialPreenchido: boolean = false;
  municipiosDisponiveis: string[] = [];


  constructor(
    private route: ActivatedRoute,
    private aliquotasService: AliquotasService,
    private firestore: AngularFirestore,
    private toastController: ToastController,
    private formBuilder: FormBuilder,
    private router: Router,
    private modalController: ModalController,
    private loggerService: LoggerService,

  ) {}

  ngOnInit() {
    this.servicoId = this.route.snapshot.paramMap.get('id')!;
    this.cabecalhoId = this.route.snapshot.paramMap.get('id')!;
    this.carregarEstados();
    this.carregarServicosSimulados();
    this.simuladorServicoForm = this.formBuilder.group({
      nomeVarejista: [''],
      ufVarejista: [''],
      atividadeVarejista: [''],
      nfsServicoVarejista: [''],
      percentualMargem: ['300'],
      percentualDesconto: ['21.998'],
      percentualTaxas: ['15'],
      comissaoDistribuidor: ['1.0'],
      comissaoVarejista: ['0.5'],
      nomeServico: ['Troca de Pneus'],
      paraQuemSimulacao: ['Ônibus da Educação'],
      numeroOs: [''],
      quantidadeServico: ['1.0'],
      valorServicoMecanico: [100.45],
      valorMateriais: [0],
      cnae: ['4520001'],
      cidade: [''],
      aliquotapisSaida: [null],
      aliquotacofinsSaida: [null],
      aliquotaISS: [''],
      csllRetido: [null],
      irpj: [null],
      csll: [null],
      finalizado: ['Nao'],
      situacao: ['Ativa'],
    });
    this.carregarDadosVarejista();

  }

  carregarDadosVarejista() {
    this.firestore.collection<Fornecedores>('fornecedor', ref =>
      ref
        .where('tipoDeEmpresa', 'in', ['Matriz', 'Filial'])
        .orderBy('nomeEmpresa')
    )
    .snapshotChanges()
    .subscribe((snapshot) => {
      this.varejistas = snapshot.map(a => {
        const data = a.payload.doc.data() as Fornecedores;
        const id = a.payload.doc.id;
        return { ...data, id };
      });
    });
  }
  carregarEstados() {
    this.estados = this.aliquotasService.getAllEstados();
  }

  carregarServicosSimulados() {
    // Buscando apenas os serviços simulados com situação "Ativa"
    this.firestore.collection<Servicos>('servicosSimulados', ref =>
      ref
        .where('cabecalhoId', '==', this.cabecalhoId) // Filtra pelo cabeçalhoId
        .where('situacao', '==', 'Ativa') // Filtra pela situação "Ativa"
    ).snapshotChanges().subscribe(
      snapshot => {
        // Mapeia os dados para incluir o ID do documento
        this.servicosSimulados = snapshot.map(doc => {
          const data = doc.payload.doc.data() as Servicos; // Dados do documento
          const id = doc.payload.doc.id; // ID do documento
          return { ...data, id }; // Retorna um objeto com ID e dados
        });

        // Ordena a tabela pela sequência
        this.servicosSimulados.sort((a, b) => a.sequencia - b.sequencia);

        this.tabelaInformacoes = this.servicosSimulados; // Atualiza a tabela com os dados carregados
      },
      error => {
        console.error('Erro ao carregar serviços simulados:', error);
      }
    );
  }


  async adicionarNaTabela() {

    this.buscarDadosCnae();

    if (this.simuladorServicoForm.valid) {
      const formData = this.simuladorServicoForm.value;

      // Adicionar o ID do cabeçalho ao formData
      formData.cabecalhoId = this.cabecalhoId;

      // Adicionar a data e hora de inserção
      const currentDate = new Date();
      formData.dataHoraInsercao = currentDate.toISOString();

      // Adicionar um campo de sequência
      const sequencia = this.tabelaInformacoes.length + 1;
      formData.sequencia = sequencia;

      // Adicionar os dados à tabela local
      this.tabelaInformacoes.push({ ...formData });

      try {
        const docRef = await this.firestore.collection('servicosSimulados').add(formData);

        // Log da criação do serviço
        await this.loggerService.registrarLog(
          'criacao',
          'servicosSimulados',
          docRef.id,
          formData
        );

        const toast = await this.toastController.create({
          message: 'Serviço adicionado com sucesso!',
          duration: 2000,
          color: 'success',
        });
        toast.present();
      } catch (error) {
        console.error('Erro ao salvar serviço:', error);

        // Log de erro ao salvar serviço
        await this.loggerService.registrarLog(
          'erro',
          'servicosSimulados',
          'novo',
          null,
          null,
          `Erro ao salvar serviço: ${(error instanceof Error ? error.message : 'Erro desconhecido')}`
        );

        const toast = await this.toastController.create({
          message: 'Erro ao salvar serviço!',
          duration: 2000,
          color: 'danger',
        });
        toast.present();
      }
    } else {
      console.error('Formulário inválido');
    }
  }




    // Função para buscar dados do CNAE e preencher no formulário
    async buscarDadosCnae() {
      const cnae = this.simuladorServicoForm.get('cnae')?.value;

      if (cnae) {
        this.firestore.collection('cnae', ref => ref.where('cnae', '==', cnae)).valueChanges()
          .subscribe(dados => {
            if (dados.length > 0) {
              const cnaeDados = dados[0] as CNAEs;
              this.simuladorServicoForm.patchValue({
                aliquotapisSaida: cnaeDados.aliquotapisSaida || null,
                aliquotacofinsSaida: cnaeDados.aliquotacofinsSaida || null,
                aliquotaISS: cnaeDados.aliquotaISS || '',
                csllRetido: cnaeDados.csllRetido || null,
                irpj: cnaeDados.irpj || null,
                csll: cnaeDados.csll || null
              });
            } else {
              this.simuladorServicoForm.patchValue({
                aliquotapisSaida: null,
                aliquotacofinsSaida: null,
                aliquotaISS: '',
                csllRetido: null,
                irpj: null,
                csll: null
              });
            }
          }, error => {
            console.error("Erro ao buscar CNAE: ", error);
            this.simuladorServicoForm.patchValue({
              aliquotapisSaida: null,
              aliquotacofinsSaida: null,
              aliquotaISS: '',
              csllRetido: null,
              irpj: null,
              csll: null
            });
          });
      }
    }




    async finalizarSimulacao() {
      if (!this.cabecalhoId) {
        console.error('Cabeçalho de serviço não encontrado.');
        return;
      }

      try {
        await this.firestore.collection('cabecalhoServico').doc(this.cabecalhoId).update({ finalizado: 'Sim' });

        // Log da finalização da simulação
        await this.loggerService.registrarLog(
          'atualizacao',
          'cabecalhoServico',
          this.cabecalhoId,
          { finalizado: 'Sim' }
        );

        const toast = await this.toastController.create({
          message: 'Simulação finalizada!',
          duration: 2000,
          color: 'success',
        });
        toast.present();
        this.router.navigate(['/home']);
      } catch (error) {
        console.error('Erro ao finalizar simulação:', error);

        // Log do erro na finalização
        await this.loggerService.registrarLog(
          'erro',
          'cabecalhoServico',
          this.cabecalhoId,
          null,
          null,
          `Erro ao finalizar simulação: ${(error instanceof Error ? error.message : 'Erro desconhecido')}`
        );

        const toast = await this.toastController.create({
          message: 'Erro ao finalizar simulação!',
          duration: 2000,
          color: 'danger',
        });
        toast.present();
      }
    }



    preencherFormularioComDados(dados: any) {
      const item = dados.item;
      this.simuladorServicoForm.patchValue({
        id: item.id,
        nomeVarejista: item.nomeVarejista,
        ufVarejista: item.ufVarejista,
        atividadeVarejista: item.atividadeVarejista,
        nfsServicoVarejista: item.nfsServicoVarejista,
        percentualMargem: item.percentualMargem,
        percentualDesconto: item.percentualDesconto,
        percentualTaxas: item.percentualTaxas,
        comissaoDistribuidor: item.comissaoDistribuidor,
        comissaoVarejista: item.comissaoVarejista,
        nomeServico: item.nomeServico,
        paraQuemSimulacao: item.paraQuemSimulacao,
        numeroOs: item.numeroOs,
        quantidadeServico: item.quantidadeServico,
        valorServicoMecanico: item.valorServicoMecanico,
        cnae: item.cnae,
        aliquotapisSaida: item.aliquotapisSaida,
        aliquotacofinsSaida: item.aliquotacofinsSaida,
        aliquotaISS: item.aliquotaISS,
        csllRetido: item.csllRetido,
        irpj: item.irpj,
        csll: item.csll,
        finalizado: item.finalizado,
        situacao: item.situacao,
      });
    }
    preencherCamposVarejista(event: any) {
      const nomeSelecionado = event.detail.value; // Nome da empresa selecionada

      // Encontrar o objeto do varejista correspondente
      const varejistaSelecionado = this.varejistas.find(v => v.nomeEmpresa === nomeSelecionado);

      if (varejistaSelecionado) {
        this.simuladorServicoForm.patchValue({
          ufVarejista: varejistaSelecionado.estado, // Preencher UF
          atividadeVarejista: varejistaSelecionado.atividadeFornecedor, // Preencher Atividade
          nfsServicoVarejista: varejistaSelecionado.nfeCompraFornecedor, // Preencher NFS Serviço
        });
      }
    }
    async abrirModalVarejista(){
      const modal = await this.modalController.create({
        component: CriarComponent,
        componentProps: {
          // se quiser passar dados, use isso:
          // fornecedorAtual: this.form.get('nomeFornecedor')?.value
        }
      });

      await modal.present();

      // Captura o retorno quando o modal for fechado
      const { data } = await modal.onDidDismiss();
      if (data) {
        console.log('Dados retornados do modal:', data);
        // ex: this.preencherCamposFornecedor(data.nome);
      }
    }

    onServicoChange(event: any) {
      const value = event.target.value;
      this.servicoPreenchido = !!value; // Converte para boolean (true se tiver valor)
      this.materialPreenchido = !this.servicoPreenchido;

      // Se serviço foi preenchido, limpa materiais
      if (this.servicoPreenchido) {
        this.simuladorServicoForm.get('valorMateriais')?.setValue(0);
      }
    }

    onMaterialChange(event: any) {
      const value = event.target.value;
      this.materialPreenchido = !!value; // Converte para boolean (true se tiver valor)
      this.servicoPreenchido = !this.materialPreenchido;

      // Se materiais foram preenchidos, limpa serviço
      if (this.materialPreenchido) {
        this.simuladorServicoForm.get('valorServicoMecanico')?.setValue(0);
      }
    }

    buscarDadosCnaeMunicipio() {
      const cnae = this.simuladorServicoForm.get('cnae')?.value;

      if (cnae) {
        this.firestore.collection('cnae', ref =>
          ref.where('cnae', '==', cnae)
        )
        .snapshotChanges()
        .subscribe(snapshot => {
          // Mapear os dados e extrair as cidades
          const cidades = snapshot.map(a => {
            const data = a.payload.doc.data() as any;
            return data.cidade;
          });

          // Remover duplicadas
          this.municipiosDisponiveis = Array.from(new Set(cidades));

          // Atualizar o campo cidade com a primeira como padrão
          this.simuladorServicoForm.patchValue({
            cidade: this.municipiosDisponiveis[0] || '' // Define a cidade padrão
          });

          // Agora que as cidades estão atualizadas, chame a função buscarDadosCnae
          this.buscarDadosCnae(); // Chama a função para preencher os outros campos relacionados ao CNAE

        }, error => {
          console.error("Erro ao buscar cidades do CNAE:", error);
          this.simuladorServicoForm.patchValue({
            cidade: '' // Limpar campo cidade em caso de erro
          });
        });
      }
    }

}
