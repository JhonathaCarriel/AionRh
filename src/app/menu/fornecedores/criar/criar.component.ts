import { AtualizarCamposService } from './../../simulador-produtos/servicos/atualizar-campos.service';
import { CommonModule, Location } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AlertController, IonicModule, LoadingController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/header/header.component';
import { AliquotasService } from 'src/app/services/aliquotas.service';
import { SubheaderComponent } from 'src/app/subheader/subheader.component';
export interface Atividades {
  nome: string;
}
export interface Boleanos {
  nome: string;
}
export interface Tipos {
  nome: string;
}
@Component({
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    HeaderComponent,
    HttpClientModule,
    SubheaderComponent,ReactiveFormsModule
  ],

  selector: 'app-criar',
  templateUrl: './criar.component.html',
  styleUrls: ['./criar.component.scss'],
})
export class CriarComponent  implements OnInit {
  pageTitle: string = 'Cadastrar Empresa'
  fornecedorForm: FormGroup

  atividades: Atividades[] = []
  boleanos: Boleanos[] = []
  tipos: Tipos[] = []
  private tipoAtividadeFornecedor: string = 'Atacadista';


  constructor(
    public location: Location,
    public http: HttpClient,
    public formBuilder: FormBuilder,
    public aliquotasService: AliquotasService,
    public atualizarCamposService: AtualizarCamposService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private firestore: AngularFirestore,


  ) {
    this.fornecedorForm = this.formBuilder.group({
      cnpj: [''],
      nomeEmpresa: ['', Validators.required],
      razaoSocial: [''],
      estado: ['', Validators.required],
      municipio: [''],
      logradouro: [''],
      numero: [''],
      bairro: [''],
      cep: [''],
      telefone1: [''],
      telefone2: [''],

      atividadeFornecedor: ['Atacadista'],
      nfeCompraFornecedor: ['Sim'],
      tipoDeEmpresa: ['Fornecedor']
    });

  }

  ngOnInit() {
    this.carregarDados();
  }

  async salvarFornecedor() {
    const fornecedor = this.fornecedorForm.value; // Obtendo os dados do formulário

    // Criando o indicador de carregamento
    const loading = await this.loadingController.create({
      message: 'Salvando fornecedor...',
      spinner: 'circles', // Tipo do spinner
      duration: 0, // O carregamento não será fechado automaticamente, precisamos fechar manualmente
    });
    await loading.present(); // Exibe o indicador de carregamento

    // Salvando os dados no Firestore
    this.firestore.collection('fornecedor').add(fornecedor)
      .then(() => {
        console.log('Fornecedor salvo com sucesso!');
        alert('Fornecedor salvo com sucesso!');
        this.fornecedorForm.reset(); // Resetando o formulário após salvar
      })
      .catch((error) => {
        console.error('Erro ao salvar fornecedor:', error);
        alert('Ocorreu um erro ao salvar o fornecedor. Tente novamente.');
      })
      .finally(() => {
        loading.dismiss(); // Fecha o indicador de carregamento
      });
  }


 async carregarDados(){
    this.carregarAtividade();
    this.carregarBoleanos();
    this.carregarTiposEmpresa();


  }

  carregarAtividade(){
    this.atividades = this.aliquotasService.atividades;
  }
  carregarBoleanos(){
    this.boleanos = this.aliquotasService.boleanos;
  }
  carregarTiposEmpresa(){
    this.tipos = this.aliquotasService.tiposEmpresas
  }




  async descartar() {
    this.location.back()
  }


  async buscarDadosFornecedor() {
    const cnpj = this.fornecedorForm.get('cnpj')?.value;

    if (!cnpj) {
      alert('Por favor, insira um CNPJ válido.');
      return;
    }

    // Exibe o indicador de carregamento
    const loading = await this.loadingController.create({
      message: 'Buscando dados...',
      spinner: 'circles', // Tipo do spinner (pode ser 'lines', 'dots', etc.)
      duration: 0, // O indicador de carregamento não desaparecerá até ser manualmente fechado
    });
    await loading.present();

    // URL da API para buscar os dados do CNPJ
    const url = `https://minhareceita.org/${cnpj}`;

    console.log(url);

    // Realizando a requisição GET
    this.http.get(url).subscribe({
      next: (dados: any) => {
        if (dados) {
          // Preenchendo os campos do formulário com os dados retornados da API
          this.fornecedorForm.patchValue({
            nomeEmpresa: dados.nome_fantasia || '',
            razaoSocial: dados.razao_social || '',
            estado: dados.uf || '',
            municipio: dados.municipio || '',
            logradouro: dados.logradouro || '',
            numero: dados.numero || '',
            complemento: dados.complemento || '',
            bairro: dados.bairro || '',
            cep: dados.cep || '',
            telefone1: dados.ddd_telefone_1 || '',
            telefone2: dados.ddd_telefone_2 || '',
            situacaoCadastral: dados.descricao_situacao_cadastral || '',
            naturezaJuridica: dados.natureza_juridica || '',
            cnaePrincipal: dados.cnae_fiscal_descricao || '',
            capitalSocial: dados.capital_social || ''
          });
        } else {
          alert('Nenhum dado encontrado para o CNPJ informado.');
        }
      },
      error: (err) => {
        console.error('Erro ao buscar os dados do CNPJ:', err);
        alert('Ocorreu um erro ao buscar os dados. Verifique o CNPJ e tente novamente.');
      },
      complete: () => {
        // Fechar o indicador de carregamento
        loading.dismiss();
      }
    });
  }
  async verificarTipoDeAtividade(event: any) {
    const novoTipo = event.target.value;

    if (novoTipo === 'Indústria') {
      const alert = await this.alertController.create({
        header: 'Confirmação',
        message: 'Você tem certeza que esta empresa é uma Indústria? A forma de cálculo dos impostos será alterada.',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              this.fornecedorForm.get('atividadeFornecedor')?.setValue(this.tipoAtividadeFornecedor);
            }
          },
          {
            text: 'Confirmar',
            handler: () => {
              this.tipoAtividadeFornecedor = novoTipo;
            }
          }
        ]
      });

      await alert.present();
    } else {
      this.tipoAtividadeFornecedor = novoTipo;
    }
  }

}
