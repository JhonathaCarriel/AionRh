
import { AtualizarCamposService } from './../../simulador-produtos/servicos/atualizar-campos.service';
import { CommonModule, Location } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormGroup, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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

export interface Fornecedores{
  id: string,
  cnpj: string,
  nomeEmpresa:  string,
  razaoSocial: string,
  estado:  string,
  municipio: string,
  logradouro:  string,
  numero:  string,
  bairro:  string,
  cep:  string,
  telefone1: string,
  telefone2:  string,

  atividadeFornecedor:  string,
  nfeCompraFornecedor:  string,
  tipoDeEmpresa:  string,
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

  selector: 'app-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
})
export class EditarComponent  implements OnInit {
  pageTitle: string = 'Editar Empresa'
  fornecedorForm: FormGroup

  atividades: Atividades[] = []
  boleanos: Boleanos[] = []
  tipos: Tipos[] = []
  FornecedorId: string =''


  fornecedores: Fornecedores[]=[]

  constructor(
    public location: Location,
    public http: HttpClient,
    public formBuilder: FormBuilder,
    public aliquotasService: AliquotasService,
    public atualizarCamposService: AtualizarCamposService,
    private loadingController: LoadingController,
    private firestore: AngularFirestore,
    private route: ActivatedRoute,
    private alertController: AlertController,


  ) {
    this.fornecedorForm = this.formBuilder.group({
      cnpj: [''],
      nomeEmpresa: [''],
      razaoSocial: [''],
      estado: [''],
      municipio: [''],
      logradouro: [''],
      numero: [''],
      bairro: [''],
      cep: [''],
      telefone1: [''],
      telefone2: [''],
      atividadeFornecedor: [''],
      nfeCompraFornecedor: [''],
      tipoDeEmpresa: ['']
    });

  }
  ngOnInit() {
    this.FornecedorId = this.route.snapshot.paramMap.get('id')!;
    this.carregarDados();
  }

  async updateFornecedor() {
    if (this.fornecedorForm.valid) {
      try {
        await this.firestore.doc(`fornecedor/${this.FornecedorId}`).update(this.fornecedorForm.value);
        const alert = await this.alertController.create({
          header: 'Sucesso',
          message: 'Empresa atualizada com sucesso!',
          buttons: ['OK']
        });
        await alert.present();
        this.location.back();
      } catch (error) {
        const alert = await this.alertController.create({
          header: 'Erro',
          message: 'Ocorreu um erro ao atualizar os dados. Por favor, tente novamente.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      const alert = await this.alertController.create({
        header: 'Erro',
        message: 'Por favor, preencha todos os campos obrigatórios.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }



 async carregarDados(){
    this.carregarAtividade();
    this.carregarBoleanos();
    this.carregarFornecedor();
    this.carregarTiposEmpresa();
    this.carregarDadosFornecedor();


  }
  carregarDadosFornecedor() {
    this.firestore.collection<Fornecedores>('fornecedor', ref => ref.orderBy('nomeEmpresa'))
      .snapshotChanges()
      .subscribe((snapshot) => {
        this.fornecedores = snapshot.map(a => {
          const data = a.payload.doc.data() as Fornecedores;
          const id = a.payload.doc.id;
          return { ...data, id };
        });
      });
  }

  carregarFornecedor(){
    this.firestore.doc<Fornecedores>(`fornecedor/${this.FornecedorId}`).valueChanges().subscribe(data => {
      if (data) {
        const FornecedorData = {
          ...data
        };

        this.fornecedorForm.patchValue(FornecedorData);
      }
    });
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


}
