import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { CNAEs } from 'src/app/cnae/cnae.page';
import { AliquotasService } from 'src/app/services/aliquotas.service';
export interface NCM{
  id: string,
  uf: string,
  crt: string,
  ncm: string,
  cest:string,
  descricao: string,
  cstIPI:  string,
  aliquotaIPI: string,
  cstpiscofinsEntrada:  string,
  cstpiscofinsSaida:  string,
  aliquotapisEntrada:string,
  aliquotapisSaida: string,
  aliquotacofinsEntrada: string,
  aliquotacofinsSaida: string,
  cfop: string,
  cst:  string,
  aliquotaicms: string,
  mvaOriginal: number,
  mvaAliquota12: number,
  mvaAliquota7: number,
  mvaAliquota4: number,
  irpj: number,
  csll:number
}
export interface EstadoAliquota {
  sigla: string;
  nome: string;
}

@Component({
  selector: 'app-criar',
  templateUrl: './criar.page.html',
  styleUrls: ['./criar.page.scss'],
})
export class CriarPage implements OnInit {
  pageTitle: string ='Criar Simulador de Serviço';
  simuladorServicoForm: FormGroup;
  tabelaInformacoes: any[] = [];
  estados: EstadoAliquota[] = [];


  atividades = [
    { nome: 'Atacadista' },
    { nome: 'Distribuidor' },
    { nome: 'Fabricante' },
    { nome: 'Varejista' },
    { nome: 'Indústria' }
  ]

  boleanos = [
    { nome: 'Sim', value: 'Sim' },
    { nome: 'Não', value: 'Nao' }
  ]


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private aliquotasService: AliquotasService,
    private toastController: ToastController,
    private firestore: AngularFirestore,
  ) {
    this.simuladorServicoForm = this.formBuilder.group({

      nomeVarejista: ['Suporte Máquinas - Filial AC'],
      ufVarejista: ['AC'],
      atividadeVarejista: ['Varejista'],
      nfsServicoVarejista: ['Sim'],
      percentualMargem: ['300'],
      percentualDesconto: ['21.998'],
      percentualTaxas: ['15'],
      comissaoDistribuidor: ['1.0'],
      comissaoVarejista: ['0.5'],
      nomeServico: ['Troca de Pneus'],
      paraQuemSimulacao: ['Ônibus da Educação'],
      quantidadeServico: ['1.0'],
      valorServicoMecanico: ['250.56'],
      cnae: ['4520001'],

      aliquotapisSaida: [null],
      aliquotacofinsSaida: [null],
      aliquotaISS: [''],
      csllRetido: [null],
      irpj: [null],
      csll: [null],

    });

  }

  ngOnInit() {
    this.carregarEstados();
    this.buscarDadosCnae();
  }

  carregarEstados() {
    this.estados = this.aliquotasService.getAllEstados();
  }
  async adicionarNaTabela() {

    if (this.simuladorServicoForm.valid) {
      const formData = this.simuladorServicoForm.value;

      this.tabelaInformacoes.push({ ...formData });
    } else {
      console.error('Formulário inválido');
    }
  }

  buscarDadosCnae() {
    const cnae = this.simuladorServicoForm.get('cnae')?.value;

    if (cnae) {
      // Realizando a consulta no Firestore diretamente no componente
      this.firestore.collection('cnae', ref => ref.where('cnae', '==', cnae)).valueChanges()
        .subscribe(dados => {
          if (dados.length > 0) {
            // Afirmação de tipo para garantir que os dados sejam do tipo esperado
            const cnaeDados = dados[0] as CNAEs; // Afirmação de tipo

            // Atribuindo os valores retornados do CNAE aos campos do formulário
            this.simuladorServicoForm.patchValue({
              aliquotapisSaida: cnaeDados.aliquotapisSaida || null,
              aliquotacofinsSaida: cnaeDados.aliquotacofinsSaida || null,
              aliquotaISS: cnaeDados.aliquotaISS || '',
              csllRetido: cnaeDados.csllRetido || null,
              irpj: cnaeDados.irpj || null,
              csll: cnaeDados.csll || null
            });
          } else {
            // Caso não encontre o CNAE, limpar os campos
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
          console.error("Erro ao buscar CNAE: ", error); // Caso haja algum erro na consulta
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


}
